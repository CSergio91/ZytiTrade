/**
 * ZYTI Trade - Trading Engine & Risk Core Contracts
 * Modelos de datos TypeScript 100% puros y desacoplados de React y del DOM.
 * Compatibles con Web Workers, Node.js, PostgreSQL y microservicios.
 */

export type OrderSide = 'buy' | 'sell';
export type PositionSide = 'LONG' | 'SHORT';
export type OrderType = 'market' | 'limit';
export type PositionStatus = 'OPEN' | 'CLOSED';

export interface OrderRequest {
  symbol: string;
  side: OrderSide;
  orderType: OrderType;
  orderMode: 'amount' | 'risk';
  amountUsdt?: number;
  riskPercent?: number;
  slPercent: number;
  tpPercent: number;
  leverage: number;
  limitPrice?: number;
}

export interface PositionItem {
  id: string; // UUID v4 / v7
  userId?: string;
  symbol: string;
  side: PositionSide;
  orderType: OrderType;
  status: PositionStatus;
  size: string;
  sizeUnits: number;
  entry: number;
  entryTimestamp: number;
  mark: number;
  slPrice?: number | null;
  tpPrice?: number | null;
  riskPercent?: number | null;
  slPercent?: number | null;
  tpPercent?: number | null;
  leverage: number;
  collateralUsdt: number;
  pnlUsdt: number;
  pnlPercentNum: number;
  pnl: string;
  pnlPercent: string;
  isProfit: boolean;
  createdAt: string; // ISO 8601
  closedAt?: string | null;
}

export interface AccountMetrics {
  settledBalance: number;
  lockedMargin: number;
  availableBalance: number;
  unrealizedPnL: number;
  equity: number;
  openPositionsCount: number;
  isMarginCall: boolean;
}

export interface PropFirmRuleConfig {
  id: string;
  firmName: string; // e.g. "FTMO", "Funding Pips", "E8", "ZYTI Prop"
  initialBalance: number;
  maxDailyLossPercent: number; // e.g. 5% diario
  maxTotalDrawdownPercent: number; // e.g. 10% total
  maxTrailingDrawdownPercent?: number; // e.g. 6% trailing
  maxLeverage: number; // e.g. 30x o 100x
  allowWeekendHolding?: boolean;
  allowNewsTrading?: boolean;
  minTradingDays?: number;
}

export interface RiskCheckResult {
  allowed: boolean;
  reason?: string;
  requiredMargin: number;
  notionalUsd: number;
  sizeUnits: number;
  estimatedLossUsd: number;
  estimatedProfitUsd: number;
}

export interface TickEvaluationResult {
  updatedPositions: PositionItem[];
  closedPositions: PositionItem[];
  balanceDelta: number;
  events: Array<{
    type: 'TP_HIT' | 'SL_HIT';
    position: PositionItem;
    realizedPnL: number;
    price: number;
  }>;
}
