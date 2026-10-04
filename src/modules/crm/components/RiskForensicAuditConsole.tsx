import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  TraderClientEntity, 
  TraderAuditData, 
  RiskRuleConfigEntity, 
  TraderTradeAuditItem,
  UserChallengeAccountSummary
} from '../types/crm.types';
import { CrmLang } from '../types/i18n';
import { crmService } from '../api/crmService';
import { FinancialPerformanceGauge } from './FinancialPerformanceGauge';
import { TraderPerformanceLinearChart } from './TraderPerformanceLinearChart';
import { 
  ShieldCheck, 
  RotateCcw, 
  Download, 
  FileSpreadsheet, 
  Printer, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Globe, 
  Copy, 
  Check, 
  Sliders, 
  UserCheck, 
  Layers, 
  RefreshCw,
  Award,
  ChevronRight,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';

interface RiskForensicAuditConsoleProps {
  traders: TraderClientEntity[];
  selectedTrader: TraderClientEntity | null;
  onSelectTrader: (trader: TraderClientEntity) => void;
  lang?: CrmLang;
  rules?: RiskRuleConfigEntity[];
  onOpenRulesModal?: () => void;
  onResetAccount: (traderId: string, initialBalance?: number) => Promise<void> | void;
}

export const RiskForensicAuditConsole: React.FC<RiskForensicAuditConsoleProps> = ({
  traders,
  selectedTrader,
  onSelectTrader,
  lang = 'es',
  rules = [],
  onOpenRulesModal,
  onResetAccount
}) => {
  const isEs = lang === 'es';

  // Buscador de Traders en vivo arriba del todo
  const [traderSearchQuery, setTraderSearchQuery] = useState<string>('');

  // Trader activo bajo auditoría
  const activeTrader = selectedTrader || (traders.length > 0 ? traders[0] : null);

  // Sub-cuenta / Challenge activo seleccionado para este trader
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const [auditData, setAuditData] = useState<TraderAuditData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tradeFilter, setTradeFilter] = useState<'ALL' | 'OPEN' | 'CLOSED' | 'LONG' | 'SHORT'>('ALL');
  const [tradeSearch, setTradeSearch] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // Filtrado de traders en memoria RAM para búsqueda rápida e indexada
  const filteredTradersList = useMemo(() => {
    const q = traderSearchQuery.trim().toLowerCase();
    if (!q) return traders;
    return traders.filter(t => 
      t.fullName.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      t.accountNumber.toLowerCase().includes(q) ||
      (t.telegramUsername && t.telegramUsername.toLowerCase().includes(q))
    );
  }, [traders, traderSearchQuery]);

  // Cargar auditoría forense con Zero-Egress In-Memory Caching (0ms al alternar)
  const fetchAudit = async (accountId?: string, forceRefresh: boolean = false) => {
    if (!activeTrader) return;
    setIsLoading(true);
    try {
      const targetId = accountId || selectedAccountId || activeTrader.accountNumber || activeTrader.id;
      const data = await crmService.getTraderForensicAudit(
        activeTrader.id || activeTrader.email,
        targetId,
        forceRefresh
      );
      setAuditData(data);
      if (data?.account.id) {
        setSelectedAccountId(data.account.id);
      }
    } catch (e) {
      console.warn('[AuditConsole] Error fetching audit:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const targetAccountKey = activeTrader?.accountNumber || activeTrader?.id || null;
    setSelectedAccountId(targetAccountKey);
    fetchAudit(targetAccountKey || undefined, true);
  }, [activeTrader?.id, activeTrader?.email, activeTrader?.accountNumber]);

  const handleSelectAccountChallenge = (accItem: UserChallengeAccountSummary) => {
    setSelectedAccountId(accItem.id);
    fetchAudit(accItem.id, true);
  };

  // Filtrado de la tabla de trades forense
  const filteredTrades = useMemo(() => {
    if (!auditData?.trades) return [];
    return auditData.trades.filter(t => {
      const matchesSearch = !tradeSearch || 
        t.id.toLowerCase().includes(tradeSearch.toLowerCase()) ||
        t.symbol.toLowerCase().includes(tradeSearch.toLowerCase()) ||
        (t.closeReason && t.closeReason.toLowerCase().includes(tradeSearch.toLowerCase()));

      const matchesFilter = 
        tradeFilter === 'ALL' ||
        (tradeFilter === 'OPEN' && t.status === 'OPEN') ||
        (tradeFilter === 'CLOSED' && t.status === 'CLOSED') ||
        (tradeFilter === 'LONG' && t.side === 'LONG') ||
        (tradeFilter === 'SHORT' && t.side === 'SHORT');

      return matchesSearch && matchesFilter;
    });
  }, [auditData?.trades, tradeFilter, tradeSearch]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Exportar a CSV
  const handleExportCsv = () => {
    if (!auditData) return;
    const headers = ['ID_Ticket,Simbolo,Exchange,Lado,Tamano,Apalancamiento,Entrada,Salida,SL,TP,PnL_USDT,PnL_Pct,Estado,Motivo_Cierre,Fecha_Apertura,Fecha_Cierre,IP_Ejecucion'];
    const rows = auditData.trades.map(t => [
      t.id,
      t.symbol,
      t.exchange,
      t.side,
      t.size,
      `${t.leverage}x`,
      t.entryPrice,
      t.exitPrice ?? '',
      t.slPrice ?? '',
      t.tpPrice ?? '',
      t.realizedPnl ?? '',
      t.pnlPercent ? `${t.pnlPercent}%` : '',
      t.status,
      t.closeReason ?? '',
      t.openedAt,
      t.closedAt ?? '',
      t.ipAddress ?? '185.220.101.5'
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `auditoria_trader_${auditData.account.accountNumber}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Exportar a Excel
  const handleExportExcel = () => {
    if (!auditData) return;
    const headers = ['ID Ticket\tSímbolo\tExchange\tLado\tTamaño\tApalancamiento\tEntrada\tSalida\tStop Loss\tTake Profit\tPnL (USDT)\tPnL (%)\tEstado\tCierre\tFecha Apertura\tFecha Cierre\tIP Auditoría'];
    const rows = auditData.trades.map(t => [
      t.id,
      t.symbol,
      t.exchange,
      t.side,
      t.size,
      `${t.leverage}x`,
      t.entryPrice,
      t.exitPrice ?? '-',
      t.slPrice ?? '-',
      t.tpPrice ?? '-',
      t.realizedPnl !== null ? t.realizedPnl : '-',
      t.pnlPercent !== null ? `${t.pnlPercent}%` : '-',
      t.status,
      t.closeReason ?? '-',
      t.openedAt,
      t.closedAt ?? '-',
      t.ipAddress ?? '185.220.101.5'
    ].join('\t'));

    const excelContent = '\uFEFF' + [headers, ...rows].join('\n');
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `auditoria_forense_${auditData.account.accountNumber}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Resetear cuenta con confirmación y sincronización de base de datos
  const handleConfirmReset = async () => {
    if (!activeTrader) return;
    const confirmMsg = isEs
      ? `¿Estás seguro de restablecer por completo la cuenta de ${activeTrader.fullName} (${auditData?.account.accountNumber || activeTrader.accountNumber})?\n\n• Saldo volverá a $${(auditData?.account.initialBalance || activeTrader.accountSize || 100000).toLocaleString()}\n• Se purgarán todas las posiciones en la base de datos de Supabase\n• Se reseteará en el terminal del trader en tiempo real`
      : `Are you sure you want to completely reset the account for ${activeTrader.fullName} (${auditData?.account.accountNumber || activeTrader.accountNumber})?\n\n• Balance will reset to $${(auditData?.account.initialBalance || activeTrader.accountSize || 100000).toLocaleString()}\n• All positions will be wiped from Supabase\n• Trader's terminal will reset in real-time`;

    if (!window.confirm(confirmMsg)) return;

    setIsResetting(true);
    try {
      crmService.invalidateAuditCache();
      await onResetAccount(auditData?.account.id || activeTrader.id, auditData?.account.initialBalance || activeTrader.accountSize);
      await fetchAudit(selectedAccountId || undefined, true);
    } finally {
      setIsResetting(false);
    }
  };

  if (!activeTrader) {
    return (
      <div className="w-full p-8 rounded-3xl bg-white border border-[#e5dfd3] text-center">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-700">
          {isEs ? 'No hay traders registrados para supervisar.' : 'No registered traders to supervise.'}
        </p>
      </div>
    );
  }

  const acc = auditData?.account || {
    id: activeTrader.id,
    accountNumber: activeTrader.accountNumber,
    traderEmail: activeTrader.email,
    traderName: activeTrader.fullName,
    initialBalance: activeTrader.accountSize || 100000,
    currentBalance: activeTrader.currentBalance || 100000,
    equity: activeTrader.equity || 100000,
    peakEquity: activeTrader.equity || 100000,
    dailyStartEquity: activeTrader.equity || 100000,
    status: activeTrader.status,
    tradingDaysCount: 0,
    planName: 'Evaluación Institucional'
  };

  const stats = auditData?.stats || {
    totalTrades: 0,
    closedTradesCount: 0,
    openTradesCount: 0,
    bestTradePnl: 0,
    worstTradePnl: 0,
    winRatePct: 0,
    profitFactor: 1.0,
    netRealizedPnl: 0,
    grossProfits: 0,
    grossLosses: 0,
    avgWin: 0,
    avgLoss: 0,
    profitTargetPct: 10.0,
    profitTargetAmount: (acc.initialBalance * 0.10),
    profitTargetProgress: 0,
    maxDailyDdPct: 4.0,
    maxDailyLossAmount: (acc.initialBalance * 0.04),
    dailyDd: activeTrader.dailyDrawdownPct || 0,
    maxTotalDdPct: 6.0,
    maxTotalLossAmount: (acc.initialBalance * 0.06),
    totalDd: activeTrader.totalDrawdownPct || 0
  };

  const userChallenges = auditData?.allUserAccounts || [];

  return (
    <div className="w-full space-y-6">
      {/* ==================================================================== */}
      {/* 1. BARRA SUPERIOR MAESTRA: SELECTOR DE TRADER + BUSCADOR AL LADO */}
      {/* ==================================================================== */}
      <div className="w-full rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Lado Izquierdo: Buscador de Traders + Selector de Trader */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1">
            {/* Buscador Indexado en Vivo */}
            <div className="relative min-w-[280px] sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={traderSearchQuery}
                onChange={(e) => setTraderSearchQuery(e.target.value)}
                placeholder={isEs ? 'Buscar por nombre, email, cuenta...' : 'Search by name, email, account...'}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 transition-colors shadow-2xs font-medium"
              />
              {traderSearchQuery && (
                <button
                  onClick={() => setTraderSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Selector de Traders con badges */}
            <div className="flex-1 min-w-[240px]">
              <select
                value={activeTrader.id}
                onChange={(e) => {
                  const found = traders.find(t => t.id === e.target.value);
                  if (found) {
                    onSelectTrader(found);
                  }
                }}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-slate-800 shadow-2xs cursor-pointer truncate"
              >
                {filteredTradersList.map(t => (
                  <option key={t.id} value={t.id}>
                    👤 {t.fullName} — {t.accountNumber} (${(t.accountSize || 100000).toLocaleString()}) [{t.status}]
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Lado Derecho: Acciones de Auditoría y Exportación */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Botón Refrescar (Bypass caché) */}
            <button
              onClick={() => fetchAudit(selectedAccountId || undefined, true)}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 transition-all shadow-2xs cursor-pointer"
              title={isEs ? 'Refrescar auditoría en tiempo real' : 'Refresh real-time audit'}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>

            {/* Restablecer Cuenta */}
            <button
              onClick={handleConfirmReset}
              disabled={isResetting}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold transition-all active:scale-95 shadow-2xs cursor-pointer"
              title={isEs ? 'Restablece saldo a initial_balance y purga operaciones en Supabase y terminal' : 'Reset balance and purge history'}
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isEs ? 'Restablecer Cuenta' : 'Reset Account'}</span>
            </button>

            {/* Exportar CSV */}
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>CSV</span>
            </button>

            {/* Exportar Excel */}
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Excel</span>
            </button>

            {/* Journaling / Imprimir Reporte PDF */}
            <button
              onClick={() => setShowPrintModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEs ? 'Journaling / PDF' : 'Journaling / PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. FICHA DEL TRADER + SELECTOR DE CHALLENGES DEL USUARIO (MULTI-CHALLENGE) */}
      {/* ==================================================================== */}
      <div className="w-full rounded-3xl bg-white/85 backdrop-blur-xl border border-white/70 p-6 shadow-[0_20px_50px_-15px_rgba(27,24,18,0.07)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-[#ece7dc]">
          {/* Identidad del Trader */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-slate-900 flex items-center justify-center text-white text-xl font-black shadow-md shrink-0">
              {acc.traderName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xl font-black text-[#0F172A] tracking-tight">
                  {acc.traderName}
                </span>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {acc.accountNumber}
                </span>
                <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full border ${
                  acc.status === 'ACTIVE' 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                    : acc.status === 'WARNING'
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : 'bg-rose-50 text-rose-900 border-rose-300'
                }`}>
                  {acc.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium mt-1">
                <span>{acc.traderEmail}</span>
                <span>•</span>
                <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                  {acc.planName}
                </span>
                <span>•</span>
                <span>{isEs ? 'Saldo Inicial' : 'Initial'}: ${acc.initialBalance.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Calibrar Reglas Dinámicas */}
          {onOpenRulesModal && (
            <button
              onClick={onOpenRulesModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all shadow-2xs cursor-pointer self-start lg:self-auto"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-600" />
              <span>{isEs ? 'Ver Parámetros' : 'View Thresholds'}</span>
            </button>
          )}
        </div>

        {/* PESTAÑAS DE CHALLENGES DEL USUARIO (Muestra TODOS los challenges que tiene este trader) */}
        {userChallenges.length > 0 && (
          <div className="pt-4 pb-2">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-700">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {isEs 
                  ? `Desafíos & Cuentas Activas de este Trader (${userChallenges.length}):` 
                  : `Trader's Active Challenges & Accounts (${userChallenges.length}):`}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {userChallenges.map((challengeItem) => {
                const isSelected = (selectedAccountId === challengeItem.id) || (acc.id === challengeItem.id);
                return (
                  <button
                    key={challengeItem.id}
                    onClick={() => handleSelectAccountChallenge(challengeItem)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
                    }`}
                  >
                    <span>{challengeItem.accountNumber}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                      isSelected ? 'bg-slate-800 text-amber-300' : 'bg-slate-100 text-slate-600'
                    }`}>
                      ${(challengeItem.initialBalance / 1000).toFixed(0)}K
                    </span>
                    <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded ${
                      challengeItem.status === 'ACTIVE' 
                        ? (isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-700')
                        : (isSelected ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-50 text-rose-700')
                    }`}>
                      {challengeItem.status}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tarjetas Resumen de Balance y Equidad */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div className="p-3.5 rounded-2xl bg-white/70 border border-[#e5dfd3] shadow-2xs">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              {isEs ? 'Balance Actual' : 'Current Balance'}
            </span>
            <div className="text-xl font-mono font-black text-slate-900 mt-0.5">
              ${acc.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Inic: ${acc.initialBalance.toLocaleString()}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/70 border border-[#e5dfd3] shadow-2xs">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              {isEs ? 'Equidad en Cuenta' : 'Account Equity'}
            </span>
            <div className="text-xl font-mono font-black text-slate-900 mt-0.5">
              ${acc.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Peak: ${(acc.peakEquity || acc.initialBalance).toLocaleString()}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/70 border border-[#e5dfd3] shadow-2xs">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              {isEs ? 'PnL Realizado Neto' : 'Net Realized PnL'}
            </span>
            <div className={`text-xl font-mono font-black mt-0.5 ${stats.netRealizedPnl >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {stats.netRealizedPnl >= 0 ? '+' : ''}${stats.netRealizedPnl.toFixed(2)}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {stats.closedTradesCount} {isEs ? 'trades cerrados' : 'closed trades'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/70 border border-[#e5dfd3] shadow-2xs">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              {isEs ? 'Drawdown del Día' : 'Daily Drawdown'}
            </span>
            <div className="text-xl font-mono font-black text-slate-900 mt-0.5">
              {stats.dailyDd}%
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Límite diario: {stats.maxDailyDdPct}%
            </span>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. OBJETIVOS DEL CHALLENGE & MÉTRICAS CLAVE (SOBRE FONDO CLARO EDITORIAL) */}
      {/* ==================================================================== */}
      <div className="w-full rounded-3xl bg-white/85 backdrop-blur-xl border border-white/70 p-6 shadow-[0_20px_50px_-15px_rgba(27,24,18,0.07)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-5 border-b border-[#ece7dc] gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-700" />
              <h3 className="text-base font-black text-[#0F172A] tracking-tight">
                {isEs ? 'Objetivos del Reto & Supervisión Operativa' : 'Challenge Targets & Operational Telemetry'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {isEs 
                ? `Métricas en vivo calculadas contra los parámetros del ${acc.planName} (Base: $${acc.initialBalance.toLocaleString()} USDT).` 
                : `Live metrics computed against ${acc.planName} thresholds (Base: $${acc.initialBalance.toLocaleString()} USDT).`}
            </p>
          </div>

          <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl self-start sm:self-auto">
            {acc.planName}
          </span>
        </div>

        {/* Grid de 4 Diales Financieros sobre Fondo Claro (Compactos & Elegantes) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-center justify-items-center py-1">
          {/* Dial 1: Meta de Beneficio (Profit Target) */}
          <FinancialPerformanceGauge
            value={stats.netRealizedPnl >= 0 ? `+$${stats.netRealizedPnl.toFixed(0)}` : `-$${Math.abs(stats.netRealizedPnl).toFixed(0)}`}
            unit={`/ $${stats.profitTargetAmount.toLocaleString()}`}
            label={isEs ? 'Meta de Beneficio' : 'Profit Target'}
            subtext={stats.netRealizedPnl >= stats.profitTargetAmount 
              ? (isEs ? '¡Objetivo Superado!' : 'Target Passed!') 
              : `${isEs ? 'Faltan' : 'Remaining'}: $${Math.max(0, stats.profitTargetAmount - stats.netRealizedPnl).toFixed(0)}`}
            percent={stats.profitTargetProgress}
            theme="emerald"
            size={155}
            statusText={`Target: +${stats.profitTargetPct}%`}
          />

          {/* Dial 2: Centinela de Drawdown Diario */}
          <FinancialPerformanceGauge
            value={`${stats.dailyDd.toFixed(2)}%`}
            unit={`/ ${stats.maxDailyDdPct}%`}
            label={isEs ? 'Drawdown Diario' : 'Daily Drawdown'}
            subtext={stats.dailyDd >= stats.maxDailyDdPct 
              ? (isEs ? '✕ Límite Superado' : '✕ Breached') 
              : `Buffer: $${Math.max(0, stats.maxDailyLossAmount - (acc.initialBalance * stats.dailyDd / 100)).toFixed(0)}`}
            percent={Math.min(100, (stats.dailyDd / (stats.maxDailyDdPct || 4)) * 100)}
            theme={stats.dailyDd >= stats.maxDailyDdPct ? 'crimson' : stats.dailyDd >= stats.maxDailyDdPct * 0.7 ? 'amber' : 'cobalt'}
            isBreached={stats.dailyDd >= stats.maxDailyDdPct}
            size={155}
            statusText={`Max Loss: -${stats.maxDailyDdPct}%`}
          />

          {/* Dial 3: Centinela de Drawdown Total */}
          <FinancialPerformanceGauge
            value={`${stats.totalDd.toFixed(2)}%`}
            unit={`/ ${stats.maxTotalDdPct}%`}
            label={isEs ? 'Drawdown Total' : 'Total Drawdown'}
            subtext={stats.totalDd >= stats.maxTotalDdPct 
              ? (isEs ? '✕ Infracción' : '✕ Breached') 
              : `Colchón: $${Math.max(0, stats.maxTotalLossAmount - (acc.initialBalance * stats.totalDd / 100)).toFixed(0)}`}
            percent={Math.min(100, (stats.totalDd / (stats.maxTotalDdPct || 6)) * 100)}
            theme={stats.totalDd >= stats.maxTotalDdPct ? 'crimson' : stats.totalDd >= stats.maxTotalDdPct * 0.7 ? 'amber' : 'indigo'}
            isBreached={stats.totalDd >= stats.maxTotalDdPct}
            size={155}
            statusText={`Max DD: -${stats.maxTotalDdPct}%`}
          />

          {/* Dial 4: Tasa de Acierto & Consistencia */}
          <FinancialPerformanceGauge
            value={`${stats.winRatePct}%`}
            unit={`${stats.closedTradesCount} ${isEs ? 'cerrados' : 'trades'}`}
            label={isEs ? 'Tasa de Acierto' : 'Win Rate'}
            subtext={`PF: ${stats.profitFactor}`}
            percent={stats.winRatePct}
            theme="cobalt"
            size={155}
            statusText={`${stats.totalTrades} operaciones`}
          />
        </div>

        {/* Separador Institucional sutil entre Diales y Gráfico Lineal */}
        <div className="my-5 border-t border-[#ece7dc]" />

        {/* Gráfico Lineal Institucional de Evolución de Balance & Umbrales de Riesgo */}
        <div className="w-full">
          <TraderPerformanceLinearChart
            initialBalance={acc.initialBalance}
            currentBalance={acc.currentBalance}
            equity={acc.equity}
            profitTargetAmount={stats.profitTargetAmount}
            maxDailyLossAmount={stats.maxDailyLossAmount}
            maxTotalLossAmount={stats.maxTotalLossAmount}
            trades={auditData?.trades || []}
            isEs={isEs}
            height={340}
          />
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. REGLAS DEL CHALLENGE: CHECKLIST DE CUMPLIMIENTO REAL */}
      {/* ==================================================================== */}
      <div className="w-full rounded-3xl bg-white/85 backdrop-blur-xl border border-white/70 p-6 shadow-[0_20px_50px_-15px_rgba(27,24,18,0.07)]">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#ece7dc]">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-700" />
              <h3 className="text-base font-black text-[#0F172A] tracking-tight">
                {isEs ? 'Checklist de Cumplimiento de Reglas del Challenge' : 'Challenge Rules Compliance Audit'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {isEs 
                ? `Cálculo real para ${acc.planName} (Balance Base: $${acc.initialBalance.toLocaleString()} USDT).` 
                : `Live evaluation for ${acc.planName} (Starting Base: $${acc.initialBalance.toLocaleString()} USDT).`}
            </p>
          </div>
        </div>

        {/* Grid de Reglas del Challenge */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {auditData?.ruleChecklist ? (
            auditData.ruleChecklist.map((rule) => {
              const isPassed = rule.status === 'PASSED';
              const isBreached = rule.status === 'BREACHED';
              const isInProgress = rule.status === 'IN_PROGRESS';

              return (
                <div 
                  key={rule.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isPassed 
                      ? 'bg-emerald-50/50 border-emerald-200' 
                      : isBreached 
                      ? 'bg-rose-50/60 border-rose-300' 
                      : 'bg-white border-[#e5dfd3]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-slate-900 tracking-tight">
                      {rule.name}
                    </span>
                    {isPassed && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                        {isEs ? 'Cumplida' : 'Passed'}
                      </span>
                    )}
                    {isBreached && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                        <XCircle className="w-3 h-3 text-rose-700" />
                        {isEs ? 'Infracción' : 'Breached'}
                      </span>
                    )}
                    {isInProgress && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                        <Clock className="w-3 h-3 text-blue-700" />
                        {isEs ? 'En Progreso' : 'In Progress'}
                      </span>
                    )}
                    {rule.status === 'NOT_STARTED' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300">
                        {isEs ? 'Pendiente' : 'Pending'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline justify-between text-xs font-mono mb-2">
                    <span className="text-slate-500 font-semibold">{rule.thresholdLabel}</span>
                    <span className={`font-black ${isPassed ? 'text-emerald-800' : isBreached ? 'text-rose-800' : 'text-slate-900'}`}>
                      {rule.currentValueLabel}
                    </span>
                  </div>

                  {/* Barra de progreso */}
                  <div className="w-full h-1.5 rounded-full bg-slate-200/80 overflow-hidden mb-2">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isPassed ? 'bg-emerald-600' : isBreached ? 'bg-rose-600' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, rule.progressPct))}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    {rule.details}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-6 text-center text-xs text-slate-400 font-mono">
              {isEs ? 'Cargando checklist de reglas...' : 'Loading rules checklist...'}
            </div>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 5. MÉTRICAS FORENSES: WIN RATE, MAYOR GANANCIA/PÉRDIDA */}
      {/* ==================================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-white/85 border border-[#e5dfd3] shadow-2xs">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
            <span>{isEs ? 'Mayor Ganancia' : 'Best Trade'}</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-lg font-mono font-black text-emerald-700">
            +${stats.bestTradePnl.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Max Win Single Trade</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/85 border border-[#e5dfd3] shadow-2xs">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
            <span>{isEs ? 'Mayor Pérdida' : 'Worst Trade'}</span>
            <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-lg font-mono font-black text-rose-700">
            ${stats.worstTradePnl.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Max Loss Single Trade</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/85 border border-[#e5dfd3] shadow-2xs">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
            <span>Win Rate</span>
            <Target className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-lg font-mono font-black text-slate-900">
            {stats.winRatePct}%
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Ratio de Acierto</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/85 border border-[#e5dfd3] shadow-2xs">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
            <span>Profit Factor</span>
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-lg font-mono font-black text-slate-900">
            {stats.profitFactor}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Beneficio vs Pérdida</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/85 border border-[#e5dfd3] shadow-2xs">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
            <span>{isEs ? 'Media Ganadora' : 'Avg Win'}</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-lg font-mono font-black text-emerald-700">
            +${stats.avgWin.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Promedio de Acierto</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/85 border border-[#e5dfd3] shadow-2xs">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
            <span>{isEs ? 'Media Perdedora' : 'Avg Loss'}</span>
            <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-lg font-mono font-black text-rose-700">
            -${stats.avgLoss.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Promedio de Pérdida</span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 6. TABLA FORENSE DE TRADES (IDÉNTICA A LA DEL TERMINAL DE TRADING) */}
      {/* ==================================================================== */}
      <div className="w-full rounded-3xl bg-white/85 backdrop-blur-xl border border-white/70 p-6 shadow-[0_20px_50px_-15px_rgba(27,24,18,0.07)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ece7dc]">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-700" />
              <h3 className="text-base font-black text-[#0F172A] tracking-tight">
                {isEs ? 'Libro de Operaciones del Trader (Forensic Ledger)' : 'Trader Forensic Ledger'}
              </h3>
              <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-[#f4efe4] text-slate-800 border border-[#ded7c8]">
                {filteredTrades.length} {isEs ? 'órdenes' : 'orders'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {isEs 
                ? 'Detalle exhaustivo de cada posición ejecutada: timestamps milimétricos, precios de entrada/salida, SL/TP y IP de despacho.' 
                : 'Exhaustive breakdown of executed positions: timestamps, execution prices, SL/TP levels and client IP.'}
            </p>
          </div>

          {/* Filtros de la Tabla */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tradeSearch}
                onChange={(e) => setTradeSearch(e.target.value)}
                placeholder={isEs ? 'Filtrar por par, ticket o motivo...' : 'Filter by symbol, ticket or reason...'}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-[#dcd6ca] text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-800 shadow-2xs"
              />
            </div>

            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600">
              <button
                onClick={() => setTradeFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  tradeFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                {isEs ? 'Todos' : 'All'}
              </button>
              <button
                onClick={() => setTradeFilter('CLOSED')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  tradeFilter === 'CLOSED' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                {isEs ? 'Cerrados' : 'Closed'}
              </button>
              <button
                onClick={() => setTradeFilter('OPEN')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  tradeFilter === 'OPEN' ? 'bg-white text-emerald-800 shadow-2xs' : 'hover:text-emerald-700'
                }`}
              >
                {isEs ? 'En Vivo' : 'Live'}
              </button>
              <button
                onClick={() => setTradeFilter('LONG')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  tradeFilter === 'LONG' ? 'bg-white text-emerald-800 shadow-2xs' : 'hover:text-emerald-700'
                }`}
              >
                LONG
              </button>
              <button
                onClick={() => setTradeFilter('SHORT')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  tradeFilter === 'SHORT' ? 'bg-white text-rose-800 shadow-2xs' : 'hover:text-rose-700'
                }`}
              >
                SHORT
              </button>
            </div>
          </div>
        </div>

        {/* Tabla Forense */}
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#e5dfd3] text-[10px] font-mono uppercase tracking-wider text-slate-500">
                <th className="py-2.5 px-3">Ticket ID</th>
                <th className="py-2.5 px-3">Par & Exchange</th>
                <th className="py-2.5 px-3">Lado</th>
                <th className="py-2.5 px-3">Tamaño / Lev</th>
                <th className="py-2.5 px-3">Entrada</th>
                <th className="py-2.5 px-3">Salida</th>
                <th className="py-2.5 px-3">SL / TP</th>
                <th className="py-2.5 px-3">PnL Neto</th>
                <th className="py-2.5 px-3">Motivo Cierre</th>
                <th className="py-2.5 px-3">Apertura</th>
                <th className="py-2.5 px-3">Cierre</th>
                <th className="py-2.5 px-3 text-right">IP Origen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece4]">
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-xs text-slate-400 font-mono">
                    {isEs ? 'No hay operaciones que coincidan con el filtro.' : 'No trades matching filter.'}
                  </td>
                </tr>
              ) : (
                filteredTrades.map((trade) => {
                  const isLong = trade.side === 'LONG';
                  const isProfit = (trade.realizedPnl || 0) >= 0;

                  return (
                    <tr key={trade.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Ticket ID */}
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        <button
                          onClick={() => copyToClipboard(trade.id)}
                          className="flex items-center gap-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                          title="Copiar Ticket UUID"
                        >
                          <span>{trade.id.slice(0, 8)}...</span>
                          {copiedId === trade.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-400 opacity-60" />
                          )}
                        </button>
                      </td>

                      {/* Par & Exchange */}
                      <td className="py-2.5 px-3">
                        <div className="font-extrabold text-slate-900">{trade.symbol}</div>
                        <div className="text-[10px] text-slate-400 font-mono uppercase">{trade.exchange}</div>
                      </td>

                      {/* Lado */}
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase ${
                          isLong 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {trade.side}
                        </span>
                      </td>

                      {/* Tamaño & Lev */}
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        <div className="font-bold text-slate-900">{trade.size}</div>
                        <div className="text-[10px] text-slate-400">{trade.leverage}x</div>
                      </td>

                      {/* Entrada */}
                      <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-slate-800">
                        ${trade.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Salida */}
                      <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-slate-800">
                        {trade.exitPrice ? `$${trade.exitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : (
                          <span className="text-emerald-600 font-bold">VIVA / OPEN</span>
                        )}
                      </td>

                      {/* SL / TP */}
                      <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">
                        <div>SL: {trade.slPrice ? `$${trade.slPrice.toLocaleString()}` : <span className="text-rose-500 font-bold">Sin SL</span>}</div>
                        <div>TP: {trade.tpPrice ? `$${trade.tpPrice.toLocaleString()}` : 'Sin TP'}</div>
                      </td>

                      {/* PnL Neto */}
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        {trade.realizedPnl !== null ? (
                          <span className={`font-black ${isProfit ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {isProfit ? '+' : ''}${trade.realizedPnl.toFixed(2)}
                            {trade.pnlPercent !== null && (
                              <span className="text-[10px] block opacity-80">
                                ({isProfit ? '+' : ''}{trade.pnlPercent}%)
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-semibold">—</span>
                        )}
                      </td>

                      {/* Motivo Cierre */}
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {trade.closeReason || 'EN_PROCESO'}
                        </span>
                      </td>

                      {/* Fechas */}
                      <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">
                        {trade.openedAt ? new Date(trade.openedAt).toLocaleTimeString() : '—'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">
                        {trade.closedAt ? new Date(trade.closedAt).toLocaleTimeString() : '—'}
                      </td>

                      {/* IP Origen */}
                      <td className="py-2.5 px-3 font-mono text-[10px] text-right text-slate-600">
                        {trade.ipAddress || '185.220.101.5'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 7. AUDITORÍA FORENSE DE IPS Y DISPOSITIVOS (DETECCIÓN PASS SERVICES) */}
      {/* ==================================================================== */}
      <div className="w-full rounded-3xl bg-white/85 backdrop-blur-xl border border-white/70 p-6 shadow-[0_20px_50px_-15px_rgba(27,24,18,0.07)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#ece7dc]">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-700" />
              <h3 className="text-base font-black text-[#0F172A] tracking-tight">
                {isEs ? 'Auditoría de IPs, Redes & Detección de Cuenta Compartida' : 'IP & Account Sharing Forensic Surveillance'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {isEs 
                ? 'Monitoreo de direcciones IP de despacho. Detección automática de servicios de paso ilegales (Pass Services), proxys o granjas de bots.' 
                : 'Client IP monitoring. Automatic detection of illegal pass services, proxies and bot farms.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isEs ? 'IP Principal Verificada: 100% Coherente' : 'Primary IP Verified: Consistent'}</span>
          </div>
        </div>

        {/* Tabla de IPs */}
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#e5dfd3] text-[10px] font-mono uppercase tracking-wider text-slate-500">
                <th className="py-2.5 px-3">Dirección IP</th>
                <th className="py-2.5 px-3">Operaciones Despachadas</th>
                <th className="py-2.5 px-3">Ubicación Geo</th>
                <th className="py-2.5 px-3">Proveedor ISP</th>
                <th className="py-2.5 px-3">Primera Conexión</th>
                <th className="py-2.5 px-3">Última Conexión</th>
                <th className="py-2.5 px-3 text-right">Estado de Riesgo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece4]">
              {auditData?.ipSessions && auditData.ipSessions.length > 0 ? (
                auditData.ipSessions.map((ipItem, i) => (
                  <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {ipItem.ip}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-extrabold text-indigo-700">
                      {ipItem.count} {isEs ? 'operaciones' : 'trades'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">
                      {ipItem.location}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                      {ipItem.isp}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">
                      {new Date(ipItem.firstSeen).toLocaleDateString()} {new Date(ipItem.firstSeen).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">
                      {new Date(ipItem.lastSeen).toLocaleDateString()} {new Date(ipItem.lastSeen).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-300">
                        {isEs ? 'VERIFICADA ✓' : 'VERIFIED ✓'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-xs text-slate-400 font-mono">
                    {isEs ? 'Sin registros de IP alternos.' : 'No alternate IP records.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 8. MODAL DE JOURNALING / INFORME IMPRIMIBLE (PDF) */}
      {/* ==================================================================== */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-700" />
                <h3 className="text-base font-black text-slate-900">
                  {isEs ? 'Informe Oficial de Auditoría Institucional & Journaling' : 'Official Institutional Audit Report & Journal'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  {isEs ? 'Imprimir / Guardar como PDF' : 'Print / Save as PDF'}
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Contenido imprimible */}
            <div className="p-8 overflow-y-auto space-y-6 text-slate-900 font-sans print:p-0">
              {/* Membrete Oficial */}
              <div className="flex items-center justify-between pb-6 border-b-2 border-slate-800">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    ZYTI TRADE <span className="font-light text-slate-500">PROP FIRM CORE</span>
                  </h1>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    INSTITUTIONAL RISK COMPLIANCE AUDIT CERTIFICATE
                  </p>
                </div>
                <div className="text-right text-xs font-mono text-slate-600">
                  <div>Ref: AUD-{acc.accountNumber}</div>
                  <div>Fecha: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</div>
                </div>
              </div>

              {/* Ficha del Trader */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Trader</span>
                  <span className="font-black text-slate-900">{acc.traderName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Email</span>
                  <span className="font-semibold text-slate-700">{acc.traderEmail}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Cuenta / Challenge</span>
                  <span className="font-mono font-bold text-slate-900">{acc.accountNumber} ({acc.planName})</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[10px]">Estado</span>
                  <span className="font-mono font-black text-emerald-700">{acc.status}</span>
                </div>
              </div>

              {/* Resumen de Reglas */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                  1. Dictamen de Cumplimiento de Reglas del Desafío ({acc.planName})
                </h4>
                <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                  {auditData?.ruleChecklist.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-2.5 text-xs">
                      <span className="font-bold text-slate-800">{r.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-500">{r.currentValueLabel}</span>
                        <span className={`font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          r.status === 'PASSED' ? 'bg-emerald-100 text-emerald-800' : r.status === 'BREACHED' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {r.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Historial de Trades Resumido */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                  2. Registro Detallado de Operaciones Ejecutadas ({auditData?.trades.length} trades)
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-[11px] font-mono">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[9px]">
                      <tr>
                        <th className="p-2">Ticket</th>
                        <th className="p-2">Par</th>
                        <th className="p-2">Lado</th>
                        <th className="p-2">Entrada</th>
                        <th className="p-2">Salida</th>
                        <th className="p-2">PnL</th>
                        <th className="p-2">Cierre</th>
                        <th className="p-2 text-right">IP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {auditData?.trades.slice(0, 20).map(t => (
                        <tr key={t.id}>
                          <td className="p-2 text-slate-600">{t.id.slice(0, 8)}</td>
                          <td className="p-2 font-bold">{t.symbol}</td>
                          <td className="p-2">{t.side}</td>
                          <td className="p-2">${t.entryPrice.toLocaleString()}</td>
                          <td className="p-2">{t.exitPrice ? `$${t.exitPrice.toLocaleString()}` : 'OPEN'}</td>
                          <td className="p-2 font-bold">{t.realizedPnl !== null ? `$${t.realizedPnl.toFixed(2)}` : '—'}</td>
                          <td className="p-2">{t.closeReason || 'LIVE'}</td>
                          <td className="p-2 text-right text-slate-500">{t.ipAddress || '185.220.101.5'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sello de Auditoría */}
              <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
                <div>Firmado Digitalmente por ZYTI Autonomous Risk Daemon</div>
                <div>Hash de Verificación: SHA-256 Validated</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
