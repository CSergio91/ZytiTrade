-- ============================================================================
-- MIGRATION: CREATE PROFILES TABLE & AUTO-SYNC TRIGGER FROM AUTH.USERS
-- ============================================================================

-- 1. Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'trader',
  provider TEXT DEFAULT 'email',
  telegram_id BIGINT,
  telegram_username TEXT,
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users and anon" ON public.profiles;
CREATE POLICY "Enable insert for authenticated users and anon" 
  ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Service role has full access" ON public.profiles;
CREATE POLICY "Service role has full access" 
  ON public.profiles FOR ALL USING (true);

-- 2. Trigger para auto-confirmar y verificar usuarios de Telegram inmediatamente (cero fricción)
CREATE OR REPLACE FUNCTION public.auto_confirm_telegram_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'provider' = 'telegram' 
     OR NEW.raw_user_meta_data->>'telegram_id' IS NOT NULL 
     OR NEW.email LIKE '%@telegram.org' THEN
    NEW.email_confirmed_at := COALESCE(NEW.email_confirmed_at, NOW());
    IF NEW.raw_user_meta_data IS NOT NULL THEN
      NEW.raw_user_meta_data := jsonb_set(NEW.raw_user_meta_data, '{email_verified}', 'true'::jsonb);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_before_insert ON auth.users;
CREATE TRIGGER on_auth_user_before_insert
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_telegram_user();

-- 3. Función Trigger para sincronizar automáticamente usuarios nuevos a public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  clean_email TEXT;
BEGIN
  -- Preservar siempre correos reales; solo omitir si es el dominio sintético obsoleto
  IF NEW.email LIKE '%@telegram.org' THEN
    clean_email := NULL;
  ELSE
    clean_email := NEW.email;
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    role,
    provider,
    telegram_id,
    telegram_username,
    is_verified,
    updated_at
  )
  VALUES (
    NEW.id,
    clean_email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'telegram_username', split_part(clean_email, '@', 1), 'Trader'),
    NEW.raw_user_meta_data->>'avatar_url',
    CASE 
      WHEN clean_email ILIKE '%admin%' THEN 'admin'
      ELSE 'trader'
    END,
    COALESCE(NEW.raw_app_meta_data->>'provider', NEW.raw_user_meta_data->>'provider', 'telegram'),
    (NEW.raw_user_meta_data->>'telegram_id')::BIGINT,
    NEW.raw_user_meta_data->>'telegram_username',
    TRUE,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    telegram_id = COALESCE(EXCLUDED.telegram_id, public.profiles.telegram_id),
    telegram_username = COALESCE(EXCLUDED.telegram_username, public.profiles.telegram_username),
    provider = COALESCE(EXCLUDED.provider, public.profiles.provider),
    is_verified = TRUE,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Vincular el trigger a auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Sincronizar usuarios ya existentes en auth.users
INSERT INTO public.profiles (id, email, full_name, role, provider, telegram_id, telegram_username, is_verified)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  'trader',
  COALESCE(raw_user_meta_data->>'provider', 'telegram'),
  (raw_user_meta_data->>'telegram_id')::BIGINT,
  raw_user_meta_data->>'telegram_username',
  TRUE
FROM auth.users
ON CONFLICT (id) DO NOTHING;
