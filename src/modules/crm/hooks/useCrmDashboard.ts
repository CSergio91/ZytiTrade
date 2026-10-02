/**
-- ============================================================================
-- ZYTI TRADE / PROP FIRM CRM — HOOK MAESTRO ERP
-- Estado reactivo de módulos ERP, Traders reales y Cuentas Demo
-- ============================================================================
*/

import { useState, useEffect, useCallback, useMemo } from 'react';
import { crmService } from '../api/crmService';
import { 
  ApiCredentialEntity, 
  CrmKpiStats, 
  CrmModuleId, 
  MonitoredPosition, 
  RiskRuleConfigEntity, 
  TraderClientEntity 
} from '../types/crm.types';

export function useCrmDashboard() {
  const [activeModule, setActiveModule] = useState<CrmModuleId>('hub');
  const [kpis, setKpis] = useState<CrmKpiStats | null>(null);
  const [traders, setTraders] = useState<TraderClientEntity[]>([]);
  const [riskRules, setRiskRules] = useState<RiskRuleConfigEntity[]>([]);
  const [selectedRuleId, setSelectedRuleId] = useState<string>('');
  const [apiCredentials, setApiCredentials] = useState<ApiCredentialEntity[]>([]);
  const [monitoredPositions, setMonitoredPositions] = useState<MonitoredPosition[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modales
  const [isRuleModalOpen, setIsRuleModalOpen] = useState<boolean>(false);
  const [editingRule, setEditingRule] = useState<RiskRuleConfigEntity | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<ApiCredentialEntity | null>(null);

  // Carga inicial de datos reales
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [tradersRes, rulesRes, keysRes] = await Promise.all([
        crmService.getTradersClients(),
        crmService.getRiskRules(),
        crmService.getApiCredentials()
      ]);

      setTraders(tradersRes);
      setRiskRules(rulesRes);
      if (rulesRes.length > 0) {
        setSelectedRuleId(rulesRes[0].id);
      }
      setApiCredentials(keysRes);

      // Métricas y posiciones en vivo basadas en los traders reales
      const kpisRes = await crmService.getKpiStats(tradersRes.length);
      setKpis(kpisRes);
      setMonitoredPositions(crmService.getInitialMonitoredPositions(tradersRes));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Simulación de Ticks en Vivo para ver el Risk Engine actuar sobre las cuentas demo
  useEffect(() => {
    if (monitoredPositions.length === 0) return;

    const interval = setInterval(() => {
      setMonitoredPositions(prev => prev.map(pos => {
        const deltaPct = (Math.random() - 0.495) * 0.001;
        const newPrice = Number((pos.currentPrice * (1 + deltaPct)).toFixed(2));
        const priceDiff = pos.side === 'LONG' ? newPrice - pos.entryPrice : pos.entryPrice - newPrice;
        const floatingPnl = Number((priceDiff * pos.sizeUnits).toFixed(2));

        // Drawdown relativo al tamaño real de cuenta (Account Size)
        const accountSize = pos.accountSize || 50000;
        const simulatedDd = floatingPnl < 0 
          ? Number((Math.abs(floatingPnl) / accountSize * 100).toFixed(2))
          : 0;

        let ruleHealth: 'HEALTHY' | 'WARNING' | 'BREACHED' = 'HEALTHY';
        let breachReason: string | undefined = undefined;

        if (simulatedDd >= 5.0) {
          ruleHealth = 'BREACHED';
          breachReason = `Drawdown diario excedido (${simulatedDd}% >= 5.00%)`;
        } else if (simulatedDd >= 3.8) {
          ruleHealth = 'WARNING';
          breachReason = `Drawdown diario al límite (${simulatedDd}% / 5.00%)`;
        }

        return {
          ...pos,
          currentPrice: newPrice,
          floatingPnl,
          dailyDrawdownPct: simulatedDd,
          ruleHealth,
          breachReason
        };
      }));
    }, 1500);

    return () => clearInterval(interval);
  }, [monitoredPositions.length]);

  const activeRule = useMemo(() => {
    return riskRules.find(r => r.id === selectedRuleId) || riskRules[0];
  }, [riskRules, selectedRuleId]);

  // Modificar tamaño de cuenta de un trader
  const handleUpdateTraderAccountSize = async (traderId: string, newSize: number) => {
    await crmService.updateTraderAccountSize(traderId, newSize);
    setTraders(prev => prev.map(t => {
      if (t.id === traderId) {
        return {
          ...t,
          accountSize: newSize,
          currentBalance: newSize + t.floatingPnl,
          equity: newSize + t.floatingPnl
        };
      }
      return t;
    }));

    // Actualizar también en el Risk Engine si está presente
    setMonitoredPositions(prev => prev.map(p => {
      if (p.id.includes(traderId)) {
        return {
          ...p,
          accountSize: newSize
        };
      }
      return p;
    }));
  };

  // Resetear balance de cuenta demo
  const handleResetTraderBalance = (traderId: string) => {
    setTraders(prev => prev.map(t => {
      if (t.id === traderId) {
        return {
          ...t,
          currentBalance: t.accountSize,
          equity: t.accountSize,
          floatingPnl: 0,
          dailyDrawdownPct: 0,
          status: 'ACTIVE'
        };
      }
      return t;
    }));
  };

  // Modificar rol de un usuario (trader, soporte, admin, marketing)
  const handleUpdateTraderRole = async (traderId: string, newRole: any) => {
    await crmService.updateTraderRole(traderId, newRole);
    setTraders(prev => prev.map(t => t.id === traderId ? { ...t, role: newRole } : t));
  };

  // Acciones de Reglas de Riesgo
  const handleSaveRule = async (ruleData: Partial<RiskRuleConfigEntity>) => {
    const saved = await crmService.saveRiskRule(ruleData);
    setRiskRules(prev => {
      const idx = prev.findIndex(r => r.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
    setSelectedRuleId(saved.id);
    setIsRuleModalOpen(false);
    setEditingRule(null);
  };

  // Acciones de API Credentials
  const handleCreateApiKey = async (params: {
    name: string;
    keyType: any;
    scopes: any;
    ipWhitelist: string[];
    rateLimitRpm: number;
  }) => {
    const created = await crmService.createApiCredential(params);
    setApiCredentials(prev => [created, ...prev]);
    setNewlyCreatedKey(created);
  };

  const handleToggleApiKey = async (id: string, isActive: boolean) => {
    await crmService.toggleApiKeyStatus(id, isActive);
    setApiCredentials(prev => prev.map(c => c.id === id ? { ...c, is_active: isActive } : c));
  };

  const handleDeleteApiKey = async (id: string) => {
    await crmService.deleteApiKey(id);
    setApiCredentials(prev => prev.filter(c => c.id !== id));
  };

  const handleEmergencyLiquidation = (positionId: string) => {
    setMonitoredPositions(prev => prev.filter(p => p.id !== positionId));
  };

  return {
    activeModule,
    setActiveModule,
    kpis,
    traders,
    riskRules,
    selectedRuleId,
    setSelectedRuleId,
    activeRule,
    apiCredentials,
    monitoredPositions,
    isLoading,
    isRuleModalOpen,
    setIsRuleModalOpen,
    editingRule,
    setEditingRule,
    isApiKeyModalOpen,
    setIsApiKeyModalOpen,
    newlyCreatedKey,
    setNewlyCreatedKey,
    handleUpdateTraderAccountSize,
    handleUpdateTraderRole,
    handleResetTraderBalance,
    handleSaveRule,
    handleCreateApiKey,
    handleToggleApiKey,
    handleDeleteApiKey,
    handleEmergencyLiquidation,
    refreshData: loadData
  };
}
