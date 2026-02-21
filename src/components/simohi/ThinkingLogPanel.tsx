'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Search,
  Zap,
  Target,
  XCircle,
  Cpu,
  Database,
  Radio,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { EtapaRaciocinio } from '@/lib/types';

// ============================================
// TIPOS DO LOG DE RACIOCÍNIO
// ============================================

interface LogEntry {
  id: string;
  timestamp: Date;
  etapa: EtapaRaciocinio;
  mensagem: string;
  agente?: string;
  dados?: Record<string, unknown>;
  fonte?: string;
}

interface ThinkingLogPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

// ============================================
// CONFIGURAÇÕES VISUAIS
// ============================================

const etapaConfig: Record<EtapaRaciocinio, { 
  icon: React.ElementType; 
  color: string; 
  bgClass: string;
  label: string;
}> = {
  ANALISE: {
    icon: Search,
    color: 'text-cyan-400',
    bgClass: 'bg-cyan-500/10 border-cyan-500/30',
    label: 'Analisando',
  },
  VERIFICACAO: {
    icon: Activity,
    color: 'text-amber-400',
    bgClass: 'bg-amber-500/10 border-amber-500/30',
    label: 'Verificando',
  },
  CONVERGENCIA: {
    icon: Target,
    color: 'text-purple-400',
    bgClass: 'bg-purple-500/10 border-purple-500/30',
    label: 'Convergência',
  },
  CONCLUSAO: {
    icon: CheckCircle2,
    color: 'text-green-400',
    bgClass: 'bg-green-500/10 border-green-500/30',
    label: 'Conclusão',
  },
};

const agentesNVIDIA = [
  { id: 'watchman', nome: 'The Watchman', funcao: 'Coleta de dados', icon: Database },
  { id: 'topographer', nome: 'The Topographer', funcao: 'Geofencing', icon: Target },
  { id: 'truth', nome: 'The Truth Engine', funcao: 'Validação cruzada', icon: Brain },
];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function ThinkingLogPanel({ isOpen, onToggle }: ThinkingLogPanelProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(true);
  const [currentAgent, setCurrentAgent] = useState<string>('watchman');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Simular análise em tempo real
  useEffect(() => {
    if (!isOpen) return;

    const mensagens: Omit<LogEntry, 'id' | 'timestamp'>[] = [
      { 
        etapa: 'ANALISE', 
        mensagem: 'Iniciando ciclo de monitoramento das 7 MRAs...',
        agente: 'watchman',
        fonte: 'SISTEMA'
      },
      { 
        etapa: 'ANALISE', 
        mensagem: 'Conectando ao INMET - 47 estações automáticas ativas',
        agente: 'watchman',
        fonte: 'INMET',
        dados: { estacoes: 47, latencia: '120ms' }
      },
      { 
        etapa: 'VERIFICACAO', 
        mensagem: 'Dados pluviométricos sincronizados com CEMADEN',
        agente: 'watchman',
        fonte: 'CEMADEN',
        dados: { chuvaMedia: '23.5mm', timestamp: new Date().toISOString() }
      },
      { 
        etapa: 'ANALISE', 
        mensagem: 'Mapeando 30 sub-bacias hidrográficas via geofencing',
        agente: 'topographer',
        fonte: 'INEA'
      },
      { 
        etapa: 'VERIFICACAO', 
        mensagem: 'Alerta Rio: Radar operacional - Reflectividade 45dBZ detectada',
        agente: 'watchman',
        fonte: 'ALERTA_RIO',
        dados: { reflectividade: 45, estimativaChuva: '28mm/h' }
      },
      { 
        etapa: 'CONVERGENCIA', 
        mensagem: 'Validação cruzada: Radar + Sensores fluviométricos',
        agente: 'truth',
        dados: { scoreConvergencia: 87 }
      },
      { 
        etapa: 'CONVERGENCIA', 
        mensagem: 'CONVERGÊNCIA CONFIRMADA para Bacia do Rio Iguaçu',
        agente: 'truth',
        dados: { 
          radarConfirmado: true, 
          sensoresConfirmados: true, 
          scoreConfianca: 94 
        }
      },
      { 
        etapa: 'CONCLUSAO', 
        mensagem: 'ALERTA MÁXIMO emitido para Sub-bacia Rio Iguaçu/Sarapuí',
        agente: 'truth',
        fonte: 'SISTEMA',
        dados: { 
          nivel: 'ALERTA_MAXIMO', 
          acoes: ['Evacuação imediata', 'Contatar Defesa Civil 193']
        }
      },
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < mensagens.length) {
        const msg = mensagens[index];
        const agenteInfo = agentesNVIDIA.find(a => a.id === msg.agente);
        if (agenteInfo) setCurrentAgent(msg.agente!);

        setLogs(prev => [{
          id: `log-${Date.now()}-${index}`,
          timestamp: new Date(),
          ...msg,
        }, ...prev].slice(0, 50));
        index++;
      } else {
        setIsProcessing(false);
        clearInterval(interval);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Auto-scroll para o topo quando novos logs chegam
  useEffect(() => {
    if (scrollRef.current && logs.length > 0) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs]);

  return (
    <>
      {/* Toggle Button - Fixed Position */}
      <motion.button
        onClick={onToggle}
        className={`fixed z-50 top-1/2 -translate-y-1/2 
          ${isOpen ? 'right-[340px] sm:right-[380px]' : 'right-0'}
          h-16 w-6 bg-slate-800/90 border border-cyan-500/30 
          flex items-center justify-center rounded-l-md
          hover:bg-slate-700/90 transition-all duration-300
          shadow-lg shadow-cyan-500/10
        `}
        whileHover={{ width: 28 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? (
          <ChevronRight className="h-4 w-4 text-cyan-400" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-cyan-400" />
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-0 top-14 bottom-0 w-[340px] sm:w-[380px] 
              bg-slate-900/95 backdrop-blur-xl border-l border-cyan-500/20
              z-40 flex flex-col shadow-2xl shadow-cyan-500/5"
          >
            {/* Header */}
            <div className="p-3 border-b border-cyan-500/20 bg-slate-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={isProcessing ? { rotate: 360 } : {}}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Brain className={`h-5 w-5 ${isProcessing ? 'text-cyan-400' : 'text-slate-500'}`} />
                  </motion.div>
                  <div>
                    <h3 className="text-sm font-semibold text-cyan-400">Raciocínio da IA</h3>
                    <p className="text-[10px] text-slate-500">
                      {isProcessing ? 'Processando...' : 'Aguardando dados'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isProcessing && (
                    <Badge variant="outline" className="border-cyan-500 text-cyan-400 text-[10px] animate-pulse">
                      LIVE
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={onToggle}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Agentes Ativos */}
              <div className="flex items-center gap-2 mt-2">
                {agentesNVIDIA.map((agente) => (
                  <div
                    key={agente.id}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px]
                      ${currentAgent === agente.id 
                        ? 'bg-cyan-500/20 border border-cyan-500/40' 
                        : 'bg-slate-800/50 border border-slate-700'
                      }
                    `}
                  >
                    <agente.icon className={`h-3 w-3 ${currentAgent === agente.id ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className={currentAgent === agente.id ? 'text-cyan-400' : 'text-slate-500'}>
                      {agente.nome}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Processamento Status */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-3 py-2 bg-cyan-500/5 border-b border-cyan-500/10"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                          className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-cyan-400 font-medium">
                      Agente ativo: {agentesNVIDIA.find(a => a.id === currentAgent)?.nome}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lista de Logs */}
            <ScrollArea ref={scrollRef} className="flex-1 p-2">
              <div className="space-y-1.5">
                <AnimatePresence initial={false}>
                  {logs.map((log, index) => {
                    const config = etapaConfig[log.etapa];
                    const Icon = config.icon;
                    const isExpanded = expandedLog === log.id;

                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: 50, height: 0 }}
                        animate={{ opacity: 1, x: 0, height: 'auto' }}
                        exit={{ opacity: 0, x: -50, height: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.02 }}
                        className={`rounded-lg border ${config.bgClass} overflow-hidden`}
                      >
                        <button
                          onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                          className="w-full p-2.5 text-left"
                        >
                          <div className="flex items-start gap-2">
                            <Icon className={`h-4 w-4 mt-0.5 ${config.color}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[10px] font-medium ${config.color}`}>
                                    {config.label}
                                  </span>
                                  {log.fonte && (
                                    <Badge variant="secondary" className="text-[8px] h-4 px-1">
                                      {log.fonte}
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-[9px] text-slate-500">
                                  {log.timestamp.toLocaleTimeString('pt-BR')}
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                                {log.mensagem}
                              </p>
                            </div>
                          </div>

                          {/* Dados Expandidos */}
                          <AnimatePresence>
                            {isExpanded && log.dados && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-2 p-2 rounded bg-slate-900/70 overflow-x-auto"
                              >
                                <pre className="text-[10px] font-mono text-slate-400 whitespace-pre-wrap">
                                  {JSON.stringify(log.dados, null, 2)}
                                </pre>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {logs.length === 0 && !isProcessing && (
                  <div className="text-center py-8">
                    <Zap className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">Aguardando análise...</p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Footer Stats */}
            <div className="p-2 border-t border-cyan-500/20 bg-slate-900/50">
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-400" />
                    {logs.filter(l => l.etapa === 'CONCLUSAO').length} conclusões
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3 text-purple-400" />
                    {logs.filter(l => l.etapa === 'CONVERGENCIA').length} convergências
                  </span>
                </div>
                <span>{logs.length} entradas</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

export function getAgentesAtivos() {
  return agentesNVIDIA;
}
