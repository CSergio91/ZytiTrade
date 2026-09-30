/**
 * ZYTI Trade - Pure Trading Engine (OMS / EMS Core)
 * Motor transaccional desacoplado de React y del DOM.
 * Puede ejecutarse en el navegador, en un Web Worker dedicado o en Node.js/Bun en el backend.
 */

import { 
  OrderRequest, 
  PositionItem, 
  AccountMetrics, 
  TickEvaluationResult,
  PropFirmRuleConfig 
} from './types';
import { RiskEngine, DEFAULT_PROP_FIRM_RULES } from './RiskEngine';

// Generador de UUID compatible con navegadores, túneles locales y workers
export const generateTradeId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {}
  }
  return 'pos_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
};

export class TradingEngine {
  /**
   * Calcula las métricas de la cuenta (Balance, Margen bloqueado, Margen disponible y Equity).
   */
  public static calculateAccountMetrics(
    settledBalance: number,
    positions: PositionItem[]
  ): AccountMetrics {
    const lockedMargin = positions.reduce((acc, p) => acc + (p.collateralUsdt || 0), 0);
    const availableBalance = Math.max(0, Number((settledBalance - lockedMargin).toFixed(2)));
    const unrealizedPnL = Number(positions.reduce((acc, p) => acc + (p.pnlUsdt || 0), 0).toFixed(2));
    const equity = Number((settledBalance + unrealizedPnL).toFixed(2));

    return {
      settledBalance,
      lockedMargin,
      availableBalance,
      unrealizedPnL,
      equity,
      openPositionsCount: positions.length,
      isMarginCall: availableBalance <= 0 && unrealizedPnL < 0
    };
  }

  /**
   * Apertura de Posición con Pre-Trade Risk Check.
   */
  public static openPosition(
    req: OrderRequest,
    currentPrice: number,
    entryTimestamp: number,
    metrics: AccountMetrics,
    rules: PropFirmRuleConfig = DEFAULT_PROP_FIRM_RULES
  ): { success: boolean; position?: PositionItem; error?: string } {
    // 1. Pre-Trade Risk Validation
    const riskCheck = RiskEngine.evaluateOrderRisk(req, metrics, currentPrice, rules);
    if (!riskCheck.allowed) {
      return { success: false, error: riskCheck.reason };
    }

    const isLong = req.side === 'buy';

    // 2. Cálculo estricto de precios SL / TP
    const calculatedSlPrice = isLong
      ? Number((currentPrice * (1 - req.slPercent / 100)).toFixed(2))
      : Number((currentPrice * (1 + req.slPercent / 100)).toFixed(2));

    const calculatedTpPrice = isLong
      ? Number((currentPrice * (1 + req.tpPercent / 100)).toFixed(2))
      : Number((currentPrice * (1 - req.tpPercent / 100)).toFixed(2));

    const newPosition: PositionItem = {
      id: generateTradeId(),
      symbol: req.symbol,
      side: isLong ? 'LONG' : 'SHORT',
      orderType: req.orderType,
      status: 'OPEN',
      size: `${riskCheck.sizeUnits.toFixed(4)} ${req.symbol.split('/')[0]}`,
      sizeUnits: riskCheck.sizeUnits,
      entry: currentPrice,
      entryTimestamp,
      mark: currentPrice,
      slPrice: calculatedSlPrice,
      tpPrice: calculatedTpPrice,
      riskPercent: req.riskPercent,
      slPercent: req.slPercent,
      tpPercent: req.tpPercent,
      leverage: req.leverage,
      collateralUsdt: riskCheck.requiredMargin,
      pnlUsdt: 0,
      pnlPercentNum: 0,
      pnl: '$0.00 USDT',
      pnlPercent: '0.00%',
      isProfit: true,
      createdAt: new Date().toISOString()
    };

    return { success: true, position: newPosition };
  }

  /**
   * Evaluación de Posiciones al recibir un Tick del Market Worker:
   * Monitorea TP / SL e impacta el balance en caso de ejecución.
   */
  public static evaluatePositionsOnTick(
    positions: PositionItem[],
    currentPrice: number,
    symbol: string
  ): TickEvaluationResult {
    if (positions.length === 0) {
      return { updatedPositions: [], closedPositions: [], balanceDelta: 0, events: [] };
    }

    let balanceDelta = 0;
    const updatedPositions: PositionItem[] = [];
    const closedPositions: PositionItem[] = [];
    const events: TickEvaluationResult['events'] = [];

    for (const pos of positions) {
      if (pos.symbol !== symbol) {
        updatedPositions.push(pos);
        continue;
      }

      const isLong = pos.side === 'LONG';

      // 1. Verificación Take Profit
      if (pos.tpPrice) {
        const hitTP = isLong ? currentPrice >= pos.tpPrice : currentPrice <= pos.tpPrice;
        if (hitTP) {
          const pnlWin = Math.abs(pos.tpPrice - pos.entry) * pos.sizeUnits;
          balanceDelta += pnlWin;
          const closed = {
            ...pos,
            status: 'CLOSED' as const,
            mark: pos.tpPrice,
            pnlUsdt: pnlWin,
            pnlPercentNum: pos.collateralUsdt > 0 ? (pnlWin / pos.collateralUsdt) * 100 : 0,
            closedAt: new Date().toISOString()
          };
          closedPositions.push(closed);
          events.push({
            type: 'TP_HIT',
            position: closed,
            realizedPnL: pnlWin,
            price: pos.tpPrice
          });
          continue;
        }
      }

      // 2. Verificación Stop Loss
      if (pos.slPrice) {
        const hitSL = isLong ? currentPrice <= pos.slPrice : currentPrice >= pos.slPrice;
        if (hitSL) {
          const pnlLoss = Math.abs(pos.slPrice - pos.entry) * pos.sizeUnits;
          balanceDelta -= pnlLoss;
          const closed = {
            ...pos,
            status: 'CLOSED' as const,
            mark: pos.slPrice,
            pnlUsdt: -pnlLoss,
            pnlPercentNum: pos.collateralUsdt > 0 ? (-pnlLoss / pos.collateralUsdt) * 100 : 0,
            closedAt: new Date().toISOString()
          };
          closedPositions.push(closed);
          events.push({
            type: 'SL_HIT',
            position: closed,
            realizedPnL: -pnlLoss,
            price: pos.slPrice
          });
          continue;
        }
      }

      // 3. PnL no realizado en vivo
      const priceDiff = isLong ? (currentPrice - pos.entry) : (pos.entry - currentPrice);
      const pnlUsdt = Number((priceDiff * pos.sizeUnits).toFixed(2));
      const pnlPercentNum = pos.collateralUsdt > 0 ? Number(((pnlUsdt / pos.collateralUsdt) * 100).toFixed(2)) : 0;
      const isProfit = pnlUsdt >= 0;

      updatedPositions.push({
        ...pos,
        mark: currentPrice,
        pnlUsdt,
        pnlPercentNum,
        pnl: `${isProfit ? '+' : ''}${pnlUsdt.toFixed(2)} USDT`,
        pnlPercent: `${isProfit ? '+' : ''}${pnlPercentNum.toFixed(2)}%`,
        isProfit
      });
    }

    return {
      updatedPositions,
      closedPositions,
      balanceDelta,
      events
    };
  }

  /**
   * Cierre manual de posición a precio de mercado.
   */
  public static closePosition(
    positions: PositionItem[],
    positionId: string
  ): { remainingPositions: PositionItem[]; closedPosition: PositionItem | null; realizedPnL: number } {
    const target = positions.find((p) => p.id === positionId);
    if (!target) {
      return { remainingPositions: positions, closedPosition: null, realizedPnL: 0 };
    }

    const remainingPositions = positions.filter((p) => p.id !== positionId);
    const closedPosition: PositionItem = {
      ...target,
      status: 'CLOSED',
      closedAt: new Date().toISOString()
    };

    return {
      remainingPositions,
      closedPosition,
      realizedPnL: target.pnlUsdt
    };
  }

  /**
   * Actualización de precios de SL / TP (soporta null para eliminar la orden).
   */
  public static updatePositionSLTP(
    positions: PositionItem[],
    id: string,
    slPrice?: number | null,
    tpPrice?: number | null
  ): PositionItem[] {
    return positions.map((pos) => {
      if (pos.id !== id) return pos;
      return {
        ...pos,
        slPrice: slPrice === null ? undefined : (slPrice !== undefined ? slPrice : pos.slPrice),
        tpPrice: tpPrice === null ? undefined : (tpPrice !== undefined ? tpPrice : pos.tpPrice)
      };
    });
  }
}
