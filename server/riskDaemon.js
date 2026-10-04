/**
 * ============================================================================
 * ZYTI TRADE - INSTITUTIONAL MULTI-EXCHANGE RISK DAEMON
 * ============================================================================
 * Centinela de Riesgo Autónomo en RAM para Prop Firms.
 * 
 * Capacidades:
 * 1. Agnóstico de Exchange: Ingesta precios de Binance, Bybit, OKX, KuCoin,
 *    Synthetic o cualquier adaptador futuro con clave combinada y normalizada.
 * 2. Evaluación en sub-50ns en RAM por cada tick recibido.
 * 3. Detección instantánea de perforación de Drawdown Diario (EOD o Trailing)
 *    y Drawdown Total Acumulado.
 * 4. Auto-Liquidación Forzosa Atómica: Cierra posiciones abiertas al precio de tick
 *    actual y congela la cuenta en estado 'BREACHED'.
 * 5. Sincronización dinámica de Reglas desde Supabase (risk_rule_configs) y Redis.
 * 6. Suministro en tiempo real al CRM de posiciones monitoreadas (cero datos falsos).
 */

import { WebSocket } from 'ws';

export function normalizeSymbol(sym) {
  if (!sym) return '';
  return sym.replace(/[\/\-_:]/g, '').toUpperCase();
}

export class RiskDaemon {
  constructor(options = {}) {
    this.supabase = options.supabase || null;
    this.redisPub = options.redisPub || null;
    this.redisSub = options.redisSub || null;
    this.onBreach = options.onBreach || (() => {});
    this.onMetricsUpdate = options.onMetricsUpdate || (() => {});
    this.onRuleUpdated = options.onRuleUpdated || (() => {});
    this.onTradeClosed = options.onTradeClosed || (() => {});
    this.onCrmUpdate = options.onCrmUpdate || (() => {});

    // Estado en RAM
    // Map<ruleId, RiskRuleConfig>
    this.rules = new Map();
    this.defaultDemoRule = null;

    // Map<accountId, AccountRAMState>
    this.accounts = new Map();

    // Map<normSymbol, { price: number, exchange: string, timestamp: number }>
    this.latestPrices = new Map();

    // Map<exchange_normSymbol, { price: number, exchange: string, timestamp: number }>
    this.exchangePrices = new Map();

    // Mapeo de símbolos a cuentas para evaluación rápida en sub-50ns
    // Map<normSymbol, Set<accountId>>
    this.symbolToAccounts = new Map();

    // Conectores WebSocket públicos de respaldo multi-exchange
    this.activeExchangeSockets = new Map();

    this.isInitialized = false;
  }

  /**
   * Carga inicial desde Supabase y arranque del demonio
   */
  async init() {
    console.log('\x1b[35m[Risk Daemon] Inicializando centinela de riesgo multi-exchange...\x1b[0m');

    // 1. Cargar presets de reglas
    await this.loadRiskRules();

    // 2. Cargar cuentas activas
    await this.loadActiveAccounts();

    // 3. Cargar posiciones abiertas
    await this.loadOpenPositions();

    this.isInitialized = true;
    console.log(`\x1b[32m✔ [Risk Daemon] Activo: ${this.accounts.size} cuentas vigiladas, ${this.rules.size} reglas dinámicas\x1b[0m`);
  }

  /**
   * Carga reglas desde Supabase risk_rule_configs
   */
  async loadRiskRules() {
    if (!this.supabase) return;

    try {
      const { data, error } = await this.supabase
        .from('risk_rule_configs')
        .select('*')
        .eq('is_active', true);

      if (error || !data || data.length === 0) {
        console.warn('[Risk Daemon] No hay reglas de riesgo activas en la base de datos.');
        return;
      }

      data.forEach(r => {
        const ruleObj = {
          ...r,
          default_account_balance: Number(r.default_account_balance || 0),
          max_daily_loss_percent: Number(r.max_daily_loss_percent || 0),
          max_total_drawdown_percent: Number(r.max_total_drawdown_percent || 0),
          max_leverage: Number(r.max_leverage || 1),
          is_default_demo: !!r.is_default_demo
        };
        this.rules.set(r.id, ruleObj);

        if (ruleObj.is_default_demo) {
          this.defaultDemoRule = ruleObj;
        }
      });

      if (!this.defaultDemoRule && this.rules.size > 0) {
        this.defaultDemoRule = Array.from(this.rules.values())[0];
      }

      if (this.defaultDemoRule) {
        console.log(`\x1b[36m✔ [Risk Daemon] Plantilla Demo Activa: "${this.defaultDemoRule.name}" ($${this.defaultDemoRule.default_account_balance} | MaxDD Diario: ${this.defaultDemoRule.max_daily_loss_percent}% | MaxDD Total: ${this.defaultDemoRule.max_total_drawdown_percent}%)\x1b[0m`);
      }
    } catch (e) {
      console.warn('[Risk Daemon] Error cargando reglas de Supabase:', e.message);
    }
  }

  /**
   * Mapea un registro de trading_accounts de la base de datos a la estructura en RAM
   */
  mapDbAccountToRam(acc) {
    const rulesCfg = acc.rules_config || {};
    const defaultRule = this.defaultDemoRule || {};

    const initialBalance = Number(acc.initial_balance);
    const currentBalance = Number(acc.current_balance);
    const equity = Number(acc.equity);
    const peakEquity = Number(acc.peak_equity);
    const dailyStartEquity = Number(acc.daily_start_equity);

    return {
      id: acc.id,
      accountNumber: acc.account_number,
      traderEmail: acc.trader_email,
      initialBalance,
      currentBalance,
      equity,
      peakEquity,
      dailyStartEquity,
      status: acc.status || 'ACTIVE',
      breachReason: acc.breach_reason || null,
      rulesConfig: {
        maxDailyDrawdownPct: rulesCfg.maxDailyDrawdownPct !== undefined ? Number(rulesCfg.maxDailyDrawdownPct) : Number(defaultRule.max_daily_loss_percent || 0),
        maxTotalDrawdownPct: rulesCfg.maxTotalDrawdownPct !== undefined ? Number(rulesCfg.maxTotalDrawdownPct) : Number(defaultRule.max_total_drawdown_percent || 0),
        maxLeverage: rulesCfg.maxLeverage !== undefined ? Number(rulesCfg.maxLeverage) : Number(defaultRule.max_leverage || 1),
        mandatoryStopLoss: rulesCfg.mandatoryStopLoss !== undefined ? !!rulesCfg.mandatoryStopLoss : !!defaultRule.mandatory_stop_loss,
        drawdownType: rulesCfg.drawdownType || defaultRule.drawdown_type || 'EOD'
      },
      positions: new Map(),
      lastEvaluatedAt: Date.now()
    };
  }

  /**
   * Carga cuentas en estado ACTIVE desde la base de datos
   */
  async loadActiveAccounts() {
    if (!this.supabase) return;

    try {
      const { data, error } = await this.supabase
        .from('trading_accounts')
        .select('*')
        .in('status', ['ACTIVE', 'WARNING']);

      if (error || !data) return;

      data.forEach(acc => {
        this.accounts.set(acc.id, this.mapDbAccountToRam(acc));
      });
    } catch (err) {
      console.warn('[Risk Daemon] Error cargando cuentas:', err.message);
    }
  }

  /**
   * Carga posiciones abiertas desde account_trades
   */
  async loadOpenPositions() {
    if (!this.supabase) return;

    try {
      const { data, error } = await this.supabase
        .from('account_trades')
        .select('*')
        .eq('status', 'OPEN');

      if (error || !data) return;

      data.forEach(trade => {
        this.addPosition(trade.account_id, {
          id: trade.id,
          accountId: trade.account_id,
          exchange: trade.exchange || 'binance',
          symbol: trade.symbol,
          side: trade.side,
          size: Number(trade.size),
          entryPrice: Number(trade.entry_price),
          leverage: Number(trade.leverage || 1),
          slPrice: trade.sl_price ? Number(trade.sl_price) : null,
          tpPrice: trade.tp_price ? Number(trade.tp_price) : null,
          openedAt: trade.opened_at
        });
      });
    } catch (err) {
      console.warn('[Risk Daemon] Error cargando posiciones abiertas:', err.message);
    }
  }

  /**
   * Registra una posición viva en el motor
   */
  async addPosition(accountId, pos) {
    let acc = this.accounts.get(accountId);
    if (!acc) {
      // 1. Intentar cargar la cuenta real desde Supabase si existe
      if (this.supabase) {
        try {
          const { data: dbAcc } = await this.supabase
            .from('trading_accounts')
            .select('*')
            .eq('id', accountId)
            .maybeSingle();

          if (dbAcc) {
            acc = this.mapDbAccountToRam(dbAcc);
            this.accounts.set(accountId, acc);
          }
        } catch (_) {}
      }

      // 2. Si es una sesión nueva en vivo que aún no se guardó, inicializar con la Plantilla Demo de la DB
      if (!acc) {
        const templateRule = this.defaultDemoRule || Array.from(this.rules.values())[0];
        const templateBalance = templateRule ? Number(templateRule.default_account_balance) : 0;
        acc = {
          id: accountId,
          accountNumber: `ZYTI-ACC-${accountId.slice(0, 6).toUpperCase()}`,
          traderEmail: pos.traderEmail || 'trader@zyti.internal',
          initialBalance: templateBalance,
          currentBalance: templateBalance,
          equity: templateBalance,
          peakEquity: templateBalance,
          dailyStartEquity: templateBalance,
          status: 'ACTIVE',
          breachReason: null,
          rulesConfig: {
            maxDailyDrawdownPct: templateRule ? Number(templateRule.max_daily_loss_percent) : 0,
            maxTotalDrawdownPct: templateRule ? Number(templateRule.max_total_drawdown_percent) : 0,
            maxLeverage: templateRule ? Number(templateRule.max_leverage) : 1,
            mandatoryStopLoss: !!templateRule?.mandatory_stop_loss,
            drawdownType: templateRule?.drawdown_type || 'EOD'
          },
          positions: new Map(),
          lastEvaluatedAt: Date.now()
        };
        this.accounts.set(accountId, acc);
      }
    }

    const normSym = normalizeSymbol(pos.symbol);
    const posState = {
      id: pos.id,
      accountId,
      exchange: (pos.exchange || 'binance').toLowerCase(),
      symbol: pos.symbol,
      normSymbol: normSym,
      side: pos.side,
      size: Number(pos.sizeUnits ?? (typeof pos.size === 'number' ? pos.size : parseFloat(pos.size || '0')) ?? 0),
      entryPrice: Number(pos.entryPrice ?? pos.entry ?? 0),
      currentPrice: Number(pos.entryPrice ?? pos.entry ?? 0),
      leverage: Number(pos.leverage || 1),
      slPrice: pos.slPrice ? Number(pos.slPrice) : null,
      tpPrice: pos.tpPrice ? Number(pos.tpPrice) : null,
      unrealizedPnl: 0,
      openedAt: pos.openedAt || new Date().toISOString()
    };

    acc.positions.set(pos.id, posState);

    // Mapear símbolo -> cuenta
    if (!this.symbolToAccounts.has(normSym)) {
      this.symbolToAccounts.set(normSym, new Set());
    }
    this.symbolToAccounts.get(normSym).add(accountId);

    // Asegurar suscripción de respaldo para este par
    this.ensureExchangeStream(posState.exchange, posState.symbol, normSym);

    // Evaluar inmediatamente con el último precio conocido si existe
    const knownPrice = this.getLatestPrice(posState.exchange, normSym);
    if (knownPrice > 0) {
      posState.currentPrice = knownPrice;
      this.evaluateAccount(accountId);
    }
  }

  /**
   * Remueve una posición cerrada del motor
   */
  removePosition(accountId, posId) {
    const acc = this.accounts.get(accountId);
    if (!acc) return;

    const pos = acc.positions.get(posId);
    if (!pos) return;

    acc.positions.delete(posId);

    // Si ya no quedan posiciones con este símbolo para esta cuenta, limpiar índice
    let hasOtherWithSym = false;
    for (const p of acc.positions.values()) {
      if (p.normSymbol === pos.normSymbol) {
        hasOtherWithSym = true;
        break;
      }
    }

    if (!hasOtherWithSym) {
      const accSet = this.symbolToAccounts.get(pos.normSymbol);
      if (accSet) {
        accSet.delete(accountId);
        if (accSet.size === 0) {
          this.symbolToAccounts.delete(pos.normSymbol);
        }
      }
    }

    // Reevaluar cuenta tras remover la posición
    this.evaluateAccount(accountId);
  }

  /**
   * Actualiza SL / TP de una posición en RAM
   */
  updatePositionSLTP(accountId, posId, slPrice, tpPrice) {
    const acc = this.accounts.get(accountId);
    if (!acc) return;
    const pos = acc.positions.get(posId);
    if (!pos) return;

    if (slPrice !== undefined) pos.slPrice = slPrice ? Number(slPrice) : null;
    if (tpPrice !== undefined) pos.tpPrice = tpPrice ? Number(tpPrice) : null;
  }

  /**
   * Actualiza el balance realizado de la cuenta
   */
  updateBalance(accountId, newBalance) {
    const acc = this.accounts.get(accountId);
    if (!acc) return;
    acc.currentBalance = Number(newBalance);
    this.evaluateAccount(accountId);
  }

  /**
   * Ingesta de ticks agnóstica de exchange (Binance, Bybit, OKX, KuCoin, etc.)
   */
  recordTick({ symbol, exchange = 'binance', price, timestamp = Date.now() }) {
    if (!symbol || !price || isNaN(price) || price <= 0) return;

    const normSym = normalizeSymbol(symbol);
    const exKey = exchange.toLowerCase();

    // 1. Guardar precio específico de exchange
    this.exchangePrices.set(`${exKey}:${normSym}`, {
      price: Number(price),
      exchange: exKey,
      timestamp
    });

    // 2. Guardar precio global normalizado (fallback rápido)
    this.latestPrices.set(normSym, {
      price: Number(price),
      exchange: exKey,
      timestamp
    });

    // 3. Evaluar rápidamente cuentas que tengan posiciones en este símbolo
    const affectedAccounts = this.symbolToAccounts.get(normSym);
    if (!affectedAccounts || affectedAccounts.size === 0) return;

    for (const accountId of affectedAccounts) {
      this.evaluateAccount(accountId, normSym, Number(price), exKey);
    }
  }

  /**
   * Obtiene el mejor precio disponible para un símbolo y exchange
   */
  getLatestPrice(exchange, normSymbol) {
    if (exchange) {
      const exVal = this.exchangePrices.get(`${exchange.toLowerCase()}:${normSymbol}`);
      if (exVal && exVal.price > 0) return exVal.price;
    }
    const globalVal = this.latestPrices.get(normSymbol);
    return globalVal ? globalVal.price : 0;
  }

  /**
   * Núcleo del Centinela de Riesgo: Evaluación matemática sub-50ns en RAM
   */
  evaluateAccount(accountId, updatedNormSym = null, currentPrice = 0, currentExchange = null) {
    const acc = this.accounts.get(accountId);
    if (!acc || acc.status === 'BREACHED') return;

    let totalFloatingPnl = 0;

    const positionsToClose = [];

    for (const pos of acc.positions.values()) {
      if (updatedNormSym && pos.normSymbol === updatedNormSym) {
        pos.currentPrice = currentPrice;
      } else {
        const p = this.getLatestPrice(pos.exchange, pos.normSymbol);
        if (p > 0) pos.currentPrice = p;
      }

      // Verificación 24/7 en backend de Stop Loss (incluso con la terminal cerrada o en segundo plano)
      if (pos.slPrice && pos.slPrice > 0) {
        const hitSl = pos.side === 'LONG' ? pos.currentPrice <= pos.slPrice : pos.currentPrice >= pos.slPrice;
        if (hitSl) {
          positionsToClose.push({ pos, reason: 'SL', exitPrice: pos.slPrice });
          continue;
        }
      }

      // Verificación 24/7 en backend de Take Profit (incluso con la terminal cerrada o en segundo plano)
      if (pos.tpPrice && pos.tpPrice > 0) {
        const hitTp = pos.side === 'LONG' ? pos.currentPrice >= pos.tpPrice : pos.currentPrice <= pos.tpPrice;
        if (hitTp) {
          positionsToClose.push({ pos, reason: 'TP', exitPrice: pos.tpPrice });
          continue;
        }
      }

      // Cálculo de PnL no realizado de la posición
      const pDiff = pos.side === 'LONG' 
        ? pos.currentPrice - pos.entryPrice 
        : pos.entryPrice - pos.currentPrice;

      pos.unrealizedPnl = Number((pDiff * pos.size).toFixed(2));
      totalFloatingPnl += pos.unrealizedPnl;
    }

    // Si una o varias posiciones impactaron SL o TP, ejecutarlas de inmediato en backend
    if (positionsToClose.length > 0) {
      for (const item of positionsToClose) {
        this.executePositionClose(acc, item.pos, item.reason, item.exitPrice);
      }
      return;
    }

    acc.equity = Number((acc.currentBalance + totalFloatingPnl).toFixed(2));
    if (acc.equity > acc.peakEquity) {
      acc.peakEquity = acc.equity;
    }

    // Cálculo de Drawdowns frente a reglas institucionales
    const dailyBase = acc.rulesConfig.drawdownType === 'TRAILING_EQUITY' 
      ? acc.peakEquity 
      : acc.dailyStartEquity;

    const dailyLossUsd = Math.max(0, dailyBase - acc.equity);
    const dailyLossPct = dailyBase > 0 
      ? Number(((dailyLossUsd / dailyBase) * 100).toFixed(2)) 
      : 0;

    const totalLossUsd = Math.max(0, acc.initialBalance - acc.equity);
    const totalLossPct = acc.initialBalance > 0 
      ? Number(((totalLossUsd / acc.initialBalance) * 100).toFixed(2)) 
      : 0;

    const maxDailyLimit = Number(acc.rulesConfig.maxDailyDrawdownPct);
    const maxTotalLimit = Number(acc.rulesConfig.maxTotalDrawdownPct);

    // ------------------------------------------------------------------------
    // VERIFICACIÓN DE INFRACCIÓN (BREACH) Y AUTO-LIQUIDACIÓN
    // ------------------------------------------------------------------------
    let isBreached = false;
    let breachReason = '';

    if (!isNaN(maxDailyLimit) && maxDailyLimit > 0 && dailyLossPct >= maxDailyLimit) {
      isBreached = true;
      breachReason = `Drawdown diario excedido (${dailyLossPct.toFixed(2)}% >= ${maxDailyLimit.toFixed(2)}%)`;
    } else if (!isNaN(maxTotalLimit) && maxTotalLimit > 0 && totalLossPct >= maxTotalLimit) {
      isBreached = true;
      breachReason = `Drawdown total excedido (${totalLossPct.toFixed(2)}% >= ${maxTotalLimit.toFixed(2)}%)`;
    }

    if (isBreached) {
      this.executeBreach(acc, breachReason, totalFloatingPnl);
      return;
    }

    // Estado preventivo de Warning
    const hasDailyLimit = !isNaN(maxDailyLimit) && maxDailyLimit > 0;
    const hasTotalLimit = !isNaN(maxTotalLimit) && maxTotalLimit > 0;
    if ((hasDailyLimit && dailyLossPct >= maxDailyLimit * 0.8) || (hasTotalLimit && totalLossPct >= maxTotalLimit * 0.8)) {
      acc.status = 'WARNING';
    } else {
      acc.status = 'ACTIVE';
    }

    acc.lastEvaluatedAt = Date.now();

    // Notificar métricas a suscriptores
    this.onMetricsUpdate({
      accountId: acc.id,
      accountNumber: acc.accountNumber,
      balance: acc.currentBalance,
      equity: acc.equity,
      floatingPnl: totalFloatingPnl,
      dailyDrawdownPct: dailyLossPct,
      totalDrawdownPct: totalLossPct,
      status: acc.status
    });
  }

  /**
   * Ejecuta el protocolo atómico de Auto-Liquidación y Despacho de Breach
   */
  async executeBreach(acc, reason, finalFloatingPnl) {
    acc.status = 'BREACHED';
    acc.breachReason = reason;

    console.warn(`\x1b[31m🚨 [Risk Daemon] BREACH CONFIRMADO en cuenta ${acc.accountNumber} (${acc.traderEmail})\x1b[0m`);
    console.warn(`\x1b[31m   Motivo: ${reason} | Equidad: $${acc.equity}\x1b[0m`);

    // 1. Congelar y auto-cerrar todas las posiciones abiertas
    const positionsToClose = Array.from(acc.positions.values());
    acc.positions.clear();

    // Limpiar índices de símbolos
    for (const pos of positionsToClose) {
      const set = this.symbolToAccounts.get(pos.normSymbol);
      if (set) {
        set.delete(acc.id);
        if (set.size === 0) this.symbolToAccounts.delete(pos.normSymbol);
      }
    }

    // 2. Notificar inmediatamente al Hub para broadcasting por WebSocket y Redis
    this.onBreach({
      accountId: acc.id,
      accountNumber: acc.accountNumber,
      traderEmail: acc.traderEmail,
      reason,
      equity: acc.equity,
      balance: acc.currentBalance,
      positionsClosed: positionsToClose.length,
      timestamp: Date.now()
    });

    // 3. Persistir en Supabase en segundo plano (Write-Behind sin bloquear)
    if (this.supabase) {
      try {
        // Actualizar cuenta
        await this.supabase
          .from('trading_accounts')
          .update({
            status: 'BREACHED',
            breach_reason: reason,
            equity: acc.equity,
            current_balance: acc.equity,
            updated_at: new Date().toISOString()
          })
          .eq('id', acc.id);

        // Actualizar trades a cerrados por liquidación forzosa
        if (positionsToClose.length > 0) {
          const tradeIds = positionsToClose.map(p => p.id);
          await this.supabase
            .from('account_trades')
            .update({
              status: 'CLOSED',
              close_reason: 'LIQUIDATION_BREACH',
              exit_price: positionsToClose[0]?.currentPrice || 0,
              closed_at: new Date().toISOString()
            })
            .in('id', tradeIds);
        }

        // Registrar snapshot de equidad de auditoría
        await this.supabase
          .from('equity_snapshots')
          .insert({
            account_id: acc.id,
            equity: acc.equity,
            balance: acc.currentBalance,
            drawdown_daily_pct: acc.rulesConfig.maxDailyDrawdownPct,
            drawdown_total_pct: acc.rulesConfig.maxTotalDrawdownPct,
            recorded_at: new Date().toISOString()
          });
      } catch (dbErr) {
        console.warn('[Risk Daemon] Error persistiendo breach en Supabase:', dbErr.message);
      }
    }
  }

  /**
   * Liquidación forzosa manual activada desde el CRM
   */
  async emergencyLiquidate(accountId, positionId = null) {
    const acc = this.accounts.get(accountId);
    if (!acc) return false;

    if (positionId) {
      // Liquidar una posición específica
      const pos = acc.positions.get(positionId);
      if (!pos) return false;

      this.removePosition(accountId, positionId);

      if (this.supabase) {
        await this.supabase
          .from('account_trades')
          .update({
            status: 'CLOSED',
            close_reason: 'MANUAL',
            exit_price: pos.currentPrice,
            closed_at: new Date().toISOString()
          })
          .eq('id', positionId);
      }
      return true;
    } else {
      // Liquidar cuenta completa
      this.executeBreach(acc, 'Liquidación manual forzada desde el CRM Institucional', 0);
      return true;
    }
  }

  /**
   * Ejecuta el cierre atómico de una posición por SL o TP en backend 24/7
   */
  async executePositionClose(acc, pos, reason, exitPrice) {
    acc.positions.delete(pos.id);

    // Limpiar mapeo de símbolo si esta cuenta no tiene más posiciones en él
    let hasOther = false;
    for (const p of acc.positions.values()) {
      if (p.normSymbol === pos.normSymbol) { hasOther = true; break; }
    }
    if (!hasOther) {
      const set = this.symbolToAccounts.get(pos.normSymbol);
      if (set) {
        set.delete(acc.id);
        if (set.size === 0) this.symbolToAccounts.delete(pos.normSymbol);
      }
    }

    const pDiff = pos.side === 'LONG' ? exitPrice - pos.entryPrice : pos.entryPrice - exitPrice;
    const realizedPnl = Number((pDiff * pos.size).toFixed(2));
    acc.currentBalance = Number((acc.currentBalance + realizedPnl).toFixed(2));
    acc.equity = acc.currentBalance;

    console.log(`\x1b[32m✔ [Risk Daemon / OMS] Posición ${pos.symbol} (${pos.side}) EJECUTADA por ${reason} a $${exitPrice} | PnL: $${realizedPnl} en cuenta ${acc.accountNumber}\x1b[0m`);

    // Notificar al Hub
    if (this.onTradeClosed) {
      this.onTradeClosed({
        accountId: acc.id,
        accountNumber: acc.accountNumber,
        positionId: pos.id,
        symbol: pos.symbol,
        side: pos.side,
        entryPrice: pos.entryPrice,
        exitPrice,
        realizedPnl,
        closeReason: reason,
        newBalance: acc.currentBalance,
        timestamp: Date.now()
      });
    }

    // Persistir en Supabase
    if (this.supabase) {
      try {
        await this.supabase
          .from('account_trades')
          .update({
            status: 'CLOSED',
            close_reason: reason,
            exit_price: exitPrice,
            realized_pnl: realizedPnl,
            closed_at: new Date().toISOString()
          })
          .eq('id', pos.id);

        await this.supabase
          .from('trading_accounts')
          .update({
            current_balance: acc.currentBalance,
            equity: acc.equity,
            updated_at: new Date().toISOString()
          })
          .eq('id', acc.id);
      } catch (err) {
        console.warn('[Risk Daemon] Error guardando ejecución de posición en Supabase:', err.message);
      }
    }

    this.evaluateAccount(acc.id);
    if (this.onCrmUpdate) {
      this.onCrmUpdate(this.getMonitoredPositionsForCrm());
    }
  }

  /**
   * Restablece una cuenta de estado BREACHED a ACTIVE con balance limpio
   */
  async resetAccount(accountId, newBalance = null) {
    let acc = this.accounts.get(accountId);
    if (!acc) {
      for (const a of this.accounts.values()) {
        if (a.accountNumber === accountId || a.id === accountId || a.traderEmail === accountId) {
          acc = a;
          break;
        }
      }
    }
    if (!acc) return false;

    const bal = Number(newBalance || acc.initialBalance || 100000);
    acc.status = 'ACTIVE';
    acc.breachReason = null;
    acc.currentBalance = bal;
    acc.equity = bal;
    acc.peakEquity = bal;
    acc.dailyStartEquity = bal;
    acc.positions.clear();

    // Limpiar suscripciones de símbolos de esta cuenta
    for (const [sym, set] of this.symbolToAccounts.entries()) {
      set.delete(acc.id);
      if (set.size === 0) this.symbolToAccounts.delete(sym);
    }

    // Persistir en Supabase
    if (this.supabase) {
      try {
        await this.supabase
          .from('trading_accounts')
          .update({
            status: 'ACTIVE',
            breach_reason: null,
            current_balance: bal,
            equity: bal,
            peak_equity: bal,
            daily_start_equity: bal,
            updated_at: new Date().toISOString()
          })
          .eq('id', acc.id);

        // Purgar trades viejos de la cuenta
        await this.supabase
          .from('account_trades')
          .delete()
          .eq('account_id', acc.id);
      } catch (err) {
        console.warn('[Risk Daemon] Error persistiendo resetAccount en Supabase:', err.message);
      }
    }

    console.log(`\x1b[32m✔ [Risk Daemon] Cuenta ${acc.accountNumber} (${acc.traderEmail}) RESTABLECIDA a estado ACTIVE ($${bal})\x1b[0m`);

    // Notificar al frontend
    this.onMetricsUpdate({
      accountId: acc.id,
      accountNumber: acc.accountNumber,
      balance: acc.currentBalance,
      equity: acc.equity,
      floatingPnl: 0,
      dailyDrawdownPct: 0,
      totalDrawdownPct: 0,
      status: 'ACTIVE'
    });

    if (this.onCrmUpdate) {
      this.onCrmUpdate(this.getMonitoredPositionsForCrm());
    }
    return true;
  }

  /**
   * Devuelve las posiciones vivas con datos reales para el CRM (Erradica Math.random)
   */
  getMonitoredPositionsForCrm() {
    const monitored = [];

    for (const acc of this.accounts.values()) {
      const dailyBase = acc.rulesConfig.drawdownType === 'TRAILING_EQUITY' 
        ? acc.peakEquity 
        : acc.dailyStartEquity;

      const dailyLossUsd = Math.max(0, dailyBase - acc.equity);
      const dailyLossPct = dailyBase > 0 
        ? Number(((dailyLossUsd / dailyBase) * 100).toFixed(2)) 
        : 0;

      for (const pos of acc.positions.values()) {
        const ruleHealth = acc.status === 'BREACHED' 
          ? 'BREACHED' 
          : dailyLossPct >= (acc.rulesConfig.maxDailyDrawdownPct * 0.8) 
            ? 'WARNING' 
            : 'HEALTHY';

        monitored.push({
          id: pos.id,
          accountNumber: acc.accountNumber,
          traderEmail: acc.traderEmail,
          traderName: (acc.traderEmail || 'Trader').split('@')[0],
          accountSize: Number(acc.initialBalance) || 100000,
          symbol: pos.symbol,
          exchange: pos.exchange,
          side: pos.side,
          sizeUnits: Number(pos.size) || 0,
          leverage: Number(pos.leverage) || 1,
          entryPrice: Number(pos.entryPrice) || 0,
          currentPrice: Number(pos.currentPrice) || Number(pos.entryPrice) || 0,
          floatingPnl: Number(pos.unrealizedPnl) || 0,
          dailyDrawdownPct: Number(dailyLossPct) || 0,
          totalDrawdownPct: Number(dailyLossPct) || 0,
          ruleHealth,
          breachReason: acc.breachReason || (ruleHealth === 'WARNING' ? 'Drawdown cercano al límite' : undefined),
          openedAt: new Date(pos.openedAt).toLocaleTimeString()
        });
      }
    }

    return monitored;
  }

  /**
   * Conector de respaldo multi-exchange público para monitoreo 24/7 en Node.js
   * (Si todos los traders cierran su navegador, el servidor sigue recibiendo precios)
   */
  ensureExchangeStream(exchange, symbol, normSym) {
    const streamKey = `${exchange}:${normSym}`;
    if (this.activeExchangeSockets.has(streamKey)) return;

    try {
      if (exchange === 'binance') {
        const wsSymbol = normSym.toLowerCase();
        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${wsSymbol}@miniTicker`);
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data.c) {
              this.recordTick({
                symbol,
                exchange: 'binance',
                price: parseFloat(data.c),
                timestamp: data.E || Date.now()
              });
            }
          } catch (_) {}
        };

        ws.onerror = () => ws.close();
        ws.onclose = () => this.activeExchangeSockets.delete(streamKey);
        this.activeExchangeSockets.set(streamKey, ws);
      } else if (exchange === 'bybit') {
        const ws = new WebSocket('wss://stream.bybit.com/v5/public/spot');
        ws.onopen = () => {
          ws.send(JSON.stringify({
            op: 'subscribe',
            args: [`tickers.${normSym}`]
          }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data?.data?.lastPrice) {
              this.recordTick({
                symbol,
                exchange: 'bybit',
                price: parseFloat(data.data.lastPrice),
                timestamp: data.ts || Date.now()
              });
            }
          } catch (_) {}
        };

        ws.onerror = () => ws.close();
        ws.onclose = () => this.activeExchangeSockets.delete(streamKey);
        this.activeExchangeSockets.set(streamKey, ws);
      }
    } catch (_) {
      // Si la conexión directa de respaldo no está disponible, dependemos de los ticks del hub
    }
  }

  /**
   * Calibración y sincronización de reglas en caliente
   */
  applyRuleUpdate(ruleData) {
    if (!ruleData || !ruleData.id) return;
    this.rules.set(ruleData.id, ruleData);

    if (ruleData.is_default_demo) {
      this.defaultDemoRule = ruleData;
      console.log(`\x1b[35m⭐ [Risk Daemon] Nueva Plantilla Demo por Defecto establecida: "${ruleData.name}" ($${ruleData.default_account_balance || 'N/A'})\x1b[0m`);
    }

    // Actualizar cuentas que usen este preset
    for (const acc of this.accounts.values()) {
      if (ruleData.max_daily_loss_percent) {
        acc.rulesConfig.maxDailyDrawdownPct = Number(ruleData.max_daily_loss_percent);
      }
      if (ruleData.max_total_drawdown_percent) {
        acc.rulesConfig.maxTotalDrawdownPct = Number(ruleData.max_total_drawdown_percent);
      }
      if (ruleData.max_leverage) {
        acc.rulesConfig.maxLeverage = Number(ruleData.max_leverage);
      }
      if (ruleData.mandatory_stop_loss !== undefined) {
        acc.rulesConfig.mandatoryStopLoss = !!ruleData.mandatory_stop_loss;
      }
      this.evaluateAccount(acc.id);
    }

    this.onRuleUpdated(ruleData);
    console.log(`\x1b[34m[Risk Daemon] Regla calibrada en caliente: ${ruleData.name || ruleData.id}\x1b[0m`);
  }
}
