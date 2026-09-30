/**
 * ZYTI Trade - Institutional Pre-Trade Risk Engine
 * Diseñado para gobernar cuentas de Trading Institucional y reglas de Prop Firms (FTMO, Funding Pips, E8, ZYTI Gateway).
 * 100% puro en memoria: evaluación sub-milisegundo agnóstica de frameworks.
 */

import { OrderRequest, AccountMetrics, PropFirmRuleConfig, RiskCheckResult } from './types';

export const DEFAULT_PROP_FIRM_RULES: PropFirmRuleConfig = {
  id: 'standard-eval',
  firmName: 'ZYTI Prop Evaluator',
  initialBalance: 10000,
  maxDailyLossPercent: 5.0, // 5% pérdida diaria máxima
  maxTotalDrawdownPercent: 10.0, // 10% pérdida total acumulada
  maxTrailingDrawdownPercent: 6.0,
  maxLeverage: 100
};

export class RiskEngine {
  /**
   * Evaluación Pre-Trade Síncrona:
   * Verifica apalancamiento, margen disponible, límites de posición y reglas de Prop Firm
   * antes de emitir la orden al EMS o al mercado.
   */
  public static evaluateOrderRisk(
    req: OrderRequest,
    metrics: AccountMetrics,
    currentPrice: number,
    rules: PropFirmRuleConfig = DEFAULT_PROP_FIRM_RULES
  ): RiskCheckResult {
    if (currentPrice <= 0) {
      return {
        allowed: false,
        reason: 'Precio de mercado inválido o no disponible.',
        requiredMargin: 0,
        notionalUsd: 0,
        sizeUnits: 0,
        estimatedLossUsd: 0,
        estimatedProfitUsd: 0
      };
    }

    // 1. Verificación de apalancamiento permitido por la Prop Firm
    if (req.leverage > rules.maxLeverage) {
      return {
        allowed: false,
        reason: `Apalancamiento de ${req.leverage}x excede el límite máximo permitido por la firma (${rules.maxLeverage}x).`,
        requiredMargin: 0,
        notionalUsd: 0,
        sizeUnits: 0,
        estimatedLossUsd: 0,
        estimatedProfitUsd: 0
      };
    }

    // 2. Cálculo de tamaño institucional
    let notionalUsd = 0;
    let requiredMargin = 0;
    let estimatedLossUsd = 0;
    let estimatedProfitUsd = 0;

    if (req.orderMode === 'risk') {
      const riskPercent = Math.max(0.1, req.riskPercent ?? 1);
      const slPercent = Math.max(0.1, req.slPercent);
      const riskAmountUsd = (metrics.settledBalance * riskPercent) / 100;
      
      // En modo riesgo, la pérdida en SL debe ser exactamente riskAmountUsd
      notionalUsd = riskAmountUsd / (slPercent / 100);
      requiredMargin = Math.max(10, Math.round(notionalUsd / req.leverage));
      estimatedLossUsd = riskAmountUsd;
      estimatedProfitUsd = notionalUsd * (req.tpPercent / 100);
    } else {
      const amountUsdt = Math.max(10, req.amountUsdt ?? 1000);
      requiredMargin = amountUsdt;
      notionalUsd = requiredMargin * req.leverage;
      estimatedLossUsd = notionalUsd * (req.slPercent / 100);
      estimatedProfitUsd = notionalUsd * (req.tpPercent / 100);
    }

    const sizeUnits = notionalUsd / currentPrice;

    // 3. Verificación de margen libre
    if (requiredMargin > metrics.availableBalance) {
      return {
        allowed: false,
        reason: `Margen insuficiente. Requiere $${requiredMargin.toLocaleString()} USDT, pero solo hay disponible $${metrics.availableBalance.toFixed(2)} USDT.`,
        requiredMargin,
        notionalUsd,
        sizeUnits,
        estimatedLossUsd,
        estimatedProfitUsd
      };
    }

    // 4. Verificación de regla de pérdida máxima permitida en una sola operación
    const maxAllowedSingleLoss = (metrics.settledBalance * rules.maxDailyLossPercent) / 100;
    if (estimatedLossUsd > maxAllowedSingleLoss) {
      return {
        allowed: false,
        reason: `El riesgo de la orden ($${estimatedLossUsd.toFixed(2)}) supera el límite diario de la Prop Firm ($${maxAllowedSingleLoss.toFixed(2)} / ${rules.maxDailyLossPercent}%).`,
        requiredMargin,
        notionalUsd,
        sizeUnits,
        estimatedLossUsd,
        estimatedProfitUsd
      };
    }

    return {
      allowed: true,
      requiredMargin,
      notionalUsd,
      sizeUnits,
      estimatedLossUsd,
      estimatedProfitUsd
    };
  }

  /**
   * Monitor de Drawdown para Prop Firms:
   * Evalúa si la cuenta ha alcanzado el límite diario o total permitido.
   */
  public static checkPropFirmStatus(
    metrics: AccountMetrics,
    dailyStartEquity: number,
    rules: PropFirmRuleConfig = DEFAULT_PROP_FIRM_RULES
  ): { breached: boolean; reason?: string; dailyLossPct: number; totalLossPct: number } {
    const dailyLossUsd = Math.max(0, dailyStartEquity - metrics.equity);
    const dailyLossPct = dailyStartEquity > 0 ? (dailyLossUsd / dailyStartEquity) * 100 : 0;

    const totalLossUsd = Math.max(0, rules.initialBalance - metrics.equity);
    const totalLossPct = rules.initialBalance > 0 ? (totalLossUsd / rules.initialBalance) * 100 : 0;

    if (dailyLossPct >= rules.maxDailyLossPercent) {
      return {
        breached: true,
        reason: `Límite diario de pérdida alcanzado (${dailyLossPct.toFixed(2)}% >= ${rules.maxDailyLossPercent}%). Cuenta pausada por reglas de Prop Firm.`,
        dailyLossPct,
        totalLossPct
      };
    }

    if (totalLossPct >= rules.maxTotalDrawdownPercent) {
      return {
        breached: true,
        reason: `Drawdown máximo total alcanzado (${totalLossPct.toFixed(2)}% >= ${rules.maxTotalDrawdownPercent}%). Regla de Prop Firm infringida.`,
        dailyLossPct,
        totalLossPct
      };
    }

    return {
      breached: false,
      dailyLossPct,
      totalLossPct
    };
  }
}
