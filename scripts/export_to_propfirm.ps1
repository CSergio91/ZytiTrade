# ============================================================================
# EXPORTADOR AUTOMATICO DE NUCLEO TRADING & MOTOR DE RIESGO A EKLIPSE FUNDED
# ============================================================================
param(
  [string]$DestinationPath = "E:\!!!!!!!!Repositorio\Eklipse Funded\GlobalCity"
)

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " EXPORTANDO CORE TRADING OS HACIA: $DestinationPath" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

if (-not (Test-Path $DestinationPath)) {
  Write-Host "[ERROR] La ruta destino no existe: $DestinationPath" -ForegroundColor Red
  exit 1
}

$sourceRoot = Split-Path -Parent $PSScriptRoot

# 1. Copiar Motor Core (Trading Engine, Risk Engine, Reglas)
Write-Host "[1/7] Copiando src/core/trading (Engine, Risk, Rules, Gateway)..." -ForegroundColor Yellow
$destCore = Join-Path $DestinationPath "src\core\trading"
New-Item -ItemType Directory -Force -Path $destCore | Out-Null
Copy-Item -Recurse -Force "$sourceRoot\src\core\trading\*" $destCore

# 2. Copiar Market Feed (WebSockets Binance/Bybit y Tipos)
Write-Host "[2/7] Copiando src/core/market-feed..." -ForegroundColor Yellow
$destMarket = Join-Path $DestinationPath "src\core\market-feed"
New-Item -ItemType Directory -Force -Path $destMarket | Out-Null
Copy-Item -Recurse -Force "$sourceRoot\src\core\market-feed\*" $destMarket

# 3. Copiar Market Data Worker
Write-Host "[3/7] Copiando src/workers/marketData.worker.ts..." -ForegroundColor Yellow
$destWorkers = Join-Path $DestinationPath "src\workers"
New-Item -ItemType Directory -Force -Path $destWorkers | Out-Null
Copy-Item -Force "$sourceRoot\src\workers\marketData.worker.ts" $destWorkers

# 4. Copiar Terminal y Componentes Graficos
Write-Host "[4/7] Copiando TradingTerminal y componentes..." -ForegroundColor Yellow
$destComponents = Join-Path $DestinationPath "src\components"
New-Item -ItemType Directory -Force -Path $destComponents | Out-Null
Copy-Item -Force "$sourceRoot\src\components\TradingTerminal.tsx" $destComponents

$destTerminal = Join-Path $DestinationPath "src\components\terminal"
New-Item -ItemType Directory -Force -Path $destTerminal | Out-Null
Copy-Item -Recurse -Force "$sourceRoot\src\components\terminal\*" $destTerminal

# 5. Copiar i18n, Audio Alerts y Supabase Helper
Write-Host "[5/7] Copiando i18n, utils de audio y lib/supabase..." -ForegroundColor Yellow
$destI18n = Join-Path $DestinationPath "src\i18n"
New-Item -ItemType Directory -Force -Path $destI18n | Out-Null
Copy-Item -Recurse -Force "$sourceRoot\src\i18n\*" $destI18n

$destUtils = Join-Path $DestinationPath "src\utils"
New-Item -ItemType Directory -Force -Path $destUtils | Out-Null
Copy-Item -Force "$sourceRoot\src\utils\audioAlerts.ts" $destUtils

$destLib = Join-Path $DestinationPath "src\lib"
New-Item -ItemType Directory -Force -Path $destLib | Out-Null
Copy-Item -Force "$sourceRoot\src\lib\supabase.ts" $destLib

# 6. Copiar Modulo CRM Institucional (Nexus ERP)
Write-Host "[6/8] Copiando src/modules/crm (Nexus CRM, Reglas, Auditoria)..." -ForegroundColor Yellow
$destCrm = Join-Path $DestinationPath "src\modules\crm"
New-Item -ItemType Directory -Force -Path $destCrm | Out-Null
Copy-Item -Recurse -Force "$sourceRoot\src\modules\crm\*" $destCrm

# 7. Copiar Servidor de Riesgo en RAM y WebSocket Gateway
Write-Host "[7/8] Copiando server (tradingHub.js y riskDaemon.js)..." -ForegroundColor Yellow
$destServer = Join-Path $DestinationPath "server"
New-Item -ItemType Directory -Force -Path $destServer | Out-Null
Copy-Item -Recurse -Force "$sourceRoot\server\*" $destServer

# 8. Copiar Esquema SQL Completo
Write-Host "[8/10] Copiando esquema SQL prop_firm_complete_schema_init.sql..." -ForegroundColor Yellow
$destSupabase = Join-Path $DestinationPath "supabase"
New-Item -ItemType Directory -Force -Path $destSupabase | Out-Null
Copy-Item -Force "$sourceRoot\supabase\prop_firm_complete_schema_init.sql" $destSupabase

# 9. Copiar Infraestructura Docker (Postgres, Redis, Gateway y SQL)
Write-Host "[9/10] Copiando stack Docker (docker/init.sql, Dockerfile.server, compose)..." -ForegroundColor Yellow
$destDocker = Join-Path $DestinationPath "docker"
New-Item -ItemType Directory -Force -Path $destDocker | Out-Null
Copy-Item -Force "$sourceRoot\supabase\prop_firm_complete_schema_init.sql" (Join-Path $destDocker "init.sql")
Copy-Item -Force "$sourceRoot\Dockerfile.server" $DestinationPath
Copy-Item -Force "$sourceRoot\docker-compose.eklipse.yml" (Join-Path $DestinationPath "docker-compose.yml")

# 10. Copiar AGENTS.md y Sincronizar Skills
Write-Host "[10/10] Sincronizando AGENTS.md y .agents/skills..." -ForegroundColor Yellow
Copy-Item -Force "$sourceRoot\AGENTS.md" $DestinationPath
$destSkills = Join-Path $DestinationPath ".agents\skills"
New-Item -ItemType Directory -Force -Path $destSkills | Out-Null
Copy-Item -Recurse -Force "$sourceRoot\.agents\skills\*" $destSkills

Write-Host ""
Write-Host "[EXITO] EXPORTACION COMPLETADA CON EXITO!" -ForegroundColor Green
Write-Host "Todos los modulos del motor, CRM, Docker, Skills y AGENTS.md estan sincronizados en $DestinationPath" -ForegroundColor Green
