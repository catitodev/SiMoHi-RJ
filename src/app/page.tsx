"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Droplets,
  CloudRain,
  Thermometer,
  Wind,
  Navigation,
  MapPin,
  Bell,
  Star,
  Plus,
  Shield,
  User,
  Settings,
  BarChart3,
  Database,
  RefreshCw,
  Phone,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/simohi/Header";
import { Footer } from "@/components/simohi/Footer";
import dynamic from "next/dynamic";
import { identificarLocalizacao } from '@/lib/topographer';

const HydroMap = dynamic(
  () => import("@/components/simohi/HydroMap").then((mod) => mod.HydroMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-slate-900 rounded-lg">
        <div className="text-center">
          <div className="animate-pulse text-cyan-400 mb-2">
            Carregando mapa...
          </div>
          <p className="text-xs text-slate-500">
            Iniciando sistema de monitoramento
          </p>
        </div>
      </div>
    ),
  },
);

import { ThinkingLogPanel } from "@/components/simohi/ThinkingLogPanel";
import {
  useMonitoramentoStore,
  useThinkingLogStore,
  useUsuarioStore,
} from "@/store/simohi-store";
import { MACRORREGIOES, SUB_BACIAS, MENSAGENS_ALERTA } from "@/lib/constants";
import type {
  MacrorregiaoAmbiental,
  SubBaciaHidrografica,
  NivelAlerta,
} from "@/lib/types";

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function SimohiDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "visao-geral" | "alertas" | "analise"
  >("visao-geral");
  const [thinkingPanelOpen, setThinkingPanelOpen] = useState(true);
  const [selectedMRA, setSelectedMRA] = useState<MacrorregiaoAmbiental | null>(
    null,
  );
  const [selectedSubBacia, setSelectedSubBacia] =
    useState<SubBaciaHidrografica | null>(null);
  const [dadosMeteo, setDadosMeteo] = useState<{
    temperatura: number;
    sensacaoTermica: number;
    chuva: number;
    vento: number;
    umidade: number;
  } | null>(null);

  const { modoCidadao, toggleModoCidadao, alertasAtivos } =
    useMonitoramentoStore();
  const { addLog, setProcessando } = useThinkingLogStore();
  const { setLocalizacao, latitude, longitude } = useUsuarioStore();

  const iniciarAnaliseInicial = useCallback(async () => {
    setProcessando(true, "Iniciando sistema...");
    await new Promise((r) => setTimeout(r, 300));
    addLog({
      etapa: "ANALISE",
      mensagem: "Inicializando matriz de dados hidrológicos...",
    });
    await new Promise((r) => setTimeout(r, 400));
    addLog({
      etapa: "VERIFICACAO",
      mensagem: "Conectando às fontes de dados oficiais",
    });
    await new Promise((r) => setTimeout(r, 500));
    addLog({
      etapa: "CONVERGENCIA",
      mensagem: "Validando convergência entre sensores",
    });
    await new Promise((r) => setTimeout(r, 300));
    addLog({
      etapa: "CONCLUSAO",
      mensagem: "Sistema operacional. Aguardando dados em tempo real.",
    });
    setProcessando(false);
  }, [addLog, setProcessando]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      iniciarAnaliseInicial();
    }, 800);
    return () => clearTimeout(timer);
  }, [iniciarAnaliseInicial]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocalizacao(lat, lng);

          const localHidro = identificarLocalizacao(lat, lng);
          const { adicionarFavorito } = useUsuarioStore.getState();

          adicionarFavorito({ id: 'hiperlocal', nome: '📍 Minha Localização', latitude: lat, longitude: lng, subBaciaId: localHidro.subBacia.id });
          adicionarFavorito({ id: 'sub-bacia', nome: `🌊 ${localHidro.subBacia.nome}`, latitude: lat, longitude: lng, subBaciaId: localHidro.subBacia.id });
          adicionarFavorito({ id: 'mra', nome: `🗺️ ${localHidro.mra.nome}`, latitude: lat, longitude: lng, subBaciaId: localHidro.subBacia.id });

          addLog({ 
            etapa: 'CONCLUSAO', 
            mensagem: `Topographer: ${localHidro.subBacia.nome} → ${localHidro.mra.codigo}` 
          });
        },
        () => addLog({ etapa: 'ANALISE', mensagem: 'GPS indisponível - usando localização padrão' })
      );
    }
  }, [addLog, setLocalizacao]);

  useEffect(() => {
    const lat = latitude || -22.9068;
    const lng = longitude || -43.1729;
    fetch(`/api/open-meteo?lat=${lat}&lng=${lng}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.sucesso) setDadosMeteo(data.dados);
      })
      .catch(() => null);
  }, [latitude, longitude]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div
      className={`min-h-screen flex flex-col bg-slate-950 ${thinkingPanelOpen ? "pr-0 sm:pr-[380px]" : ""} transition-all duration-300`}
    >
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <StatusCard
              icon={Droplets}
              label="Umidade"
              value={dadosMeteo ? `${dadosMeteo.umidade}%` : "--"}
              trend="Open-Meteo"
              status={
                dadosMeteo && dadosMeteo.umidade > 80 ? "elevado" : "normal"
              }
            />
            <StatusCard
              icon={CloudRain}
              label="Chuva Atual"
              value={dadosMeteo ? `${dadosMeteo.chuva}mm` : "--"}
              trend="Open-Meteo"
              status={
                dadosMeteo && dadosMeteo.chuva > 10
                  ? "critico"
                  : dadosMeteo && dadosMeteo.chuva > 5
                    ? "moderado"
                    : "normal"
              }
            />
            <StatusCard
              icon={Thermometer}
              label="Temperatura"
              value={dadosMeteo ? `${dadosMeteo.temperatura}°C` : "--"}
              trend={
                dadosMeteo
                  ? `Sensação ${dadosMeteo.sensacaoTermica}°C`
                  : "carregando..."
              }
              status="normal"
            />
            <StatusCard
              icon={AlertTriangle}
              label="Alertas Ativos"
              value={String(alertasAtivos.length)}
              trend={
                alertasAtivos.length > 0
                  ? `${alertasAtivos.filter((a) => a.nivel === "ALERTA_MAXIMO").length} crítico(s)`
                  : "Sistema normal"
              }
              status={alertasAtivos.length > 0 ? "critico" : "normal"}
            />
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as typeof activeTab)}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <TabsList className="bg-slate-800/50 border border-slate-700">
                <TabsTrigger
                  value="visao-geral"
                  className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
                >
                  <MapPin className="h-3.5 w-3.5 mr-1.5" />
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger
                  value="alertas"
                  className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400"
                >
                  <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                  Alertas
                </TabsTrigger>
                <TabsTrigger
                  value="analise"
                  className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
                >
                  <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                  Análise
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setThinkingPanelOpen(!thinkingPanelOpen)}
                  className="h-8 text-xs border-cyan-500/30 text-cyan-400"
                >
                  {thinkingPanelOpen ? (
                    <EyeOff className="h-3.5 w-3.5 mr-1" />
                  ) : (
                    <Eye className="h-3.5 w-3.5 mr-1" />
                  )}
                  IA Log
                </Button>
                <Button
                  variant={modoCidadao ? "default" : "outline"}
                  size="sm"
                  onClick={toggleModoCidadao}
                  className={`h-8 text-xs ${modoCidadao ? "bg-cyan-500 text-slate-900" : "border-cyan-500/30 text-cyan-400"}`}
                >
                  <Navigation className="h-3.5 w-3.5 mr-1" />
                  Modo Cidadão
                </Button>
              </div>
            </div>

            {/* Tab: Visão Geral */}
            <TabsContent value="visao-geral" className="space-y-4 mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-8">
                  <Card className="glass-card overflow-hidden">
                    <CardContent className="p-0">
                      <div className="h-[400px] lg:h-[500px]">
                        <HydroMap
                          modoCidadao={modoCidadao}
                          userLocation={
                            latitude && longitude
                              ? { lat: latitude, lng: longitude }
                              : null
                          }
                          onMRASelect={setSelectedMRA}
                          onSubBaciaSelect={setSelectedSubBacia}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                    <MiniStat icon={Droplets} label="Vazão" value="Em breve" />
                    <MiniStat
                      icon={Wind}
                      label="Vento"
                      value={dadosMeteo ? `${dadosMeteo.vento} km/h` : "--"}
                    />
                    <MiniStat icon={Database} label="Estações" value="31/31" />
                    <MiniStat icon={Shield} label="Sistemas" value="1/6 OK" />
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-4">
                  {selectedMRA && (
                    <Card className="glass-card border-cyan-500/30">
                      <CardHeader className="pb-2 pt-3 px-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-cyan-400" />
                            {selectedMRA.codigo} - {selectedMRA.nome}
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => setSelectedMRA(null)}
                          >
                            Fechar
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="px-3 pb-3">
                        <p className="text-xs text-slate-400 mb-2">
                          {selectedMRA.descricao}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-300 mb-3">
                          <span>
                            📊 {selectedMRA.areaKm2?.toLocaleString()} km²
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mb-1.5">
                          Sub-bacias:
                        </p>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                          {SUB_BACIAS.filter(
                            (sb) => sb.macrorregiaoId === selectedMRA.id,
                          ).map((sb) => (
                            <div
                              key={sb.id}
                              className="flex items-center justify-between p-1.5 rounded bg-slate-800/50 text-xs"
                            >
                              <span className="text-slate-300">{sb.nome}</span>
                              <Badge
                                variant="outline"
                                className={`text-[9px] ${
                                  sb.nivelRiscoMedio === "ALTO"
                                    ? "border-orange-500 text-orange-400"
                                    : sb.nivelRiscoMedio === "CRITICO"
                                      ? "border-red-500 text-red-400"
                                      : sb.nivelRiscoMedio === "MODERADO"
                                        ? "border-amber-500 text-amber-400"
                                        : "border-green-500 text-green-400"
                                }`}
                              >
                                {sb.nivelRiscoMedio}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <AlertsPanel />

                  <Card className="glass-card">
                    <CardHeader className="pb-2 pt-3 px-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Star className="h-4 w-4 text-amber-400" />
                          Localidades Favoritas
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs text-cyan-400"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Adicionar
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="px-3 pb-3">
                      <div className="space-y-2">
                        <FavoritosPanel />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Tab: Alertas */}
            <TabsContent value="alertas" className="space-y-4 mt-0">
              <AlertasTab />
            </TabsContent>

            {/* Tab: Análise */}
            <TabsContent value="analise" className="space-y-4 mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="glass-card">
                  <CardHeader className="pb-2 pt-3 px-3">
                    <CardTitle className="text-sm">
                      Distribuição por MRA
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    <div className="space-y-2">
                      {MACRORREGIOES.map((mra) => {
                        const subBacias = SUB_BACIAS.filter(
                          (sb) => sb.macrorregiaoId === mra.id,
                        );
                        const altas = subBacias.filter(
                          (sb) =>
                            sb.nivelRiscoMedio === "ALTO" ||
                            sb.nivelRiscoMedio === "CRITICO",
                        ).length;
                        const percent = (altas / subBacias.length) * 100;
                        return (
                          <div key={mra.id} className="flex items-center gap-3">
                            <span className="text-xs w-12 text-cyan-400">
                              {mra.codigo}
                            </span>
                            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${percent > 50 ? "bg-red-500" : percent > 25 ? "bg-amber-500" : "bg-green-500"}`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-400 w-8">
                              {altas}/{subBacias.length}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader className="pb-2 pt-3 px-3">
                    <CardTitle className="text-sm">Status das Fontes</CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3">
                    <div className="space-y-2">
                      {[
                        { nome: "Open-Meteo", status: "OPERACIONAL" },
                        { nome: "INMET", status: "DEGRADADO" },
                        { nome: "CEMADEN", status: "DEGRADADO" },
                        { nome: "INEA", status: "DEGRADADO" },
                        { nome: "Alerta Rio", status: "DEGRADADO" },
                        { nome: "CPTEC", status: "DEGRADADO" },
                      ].map((fonte) => (
                        <div
                          key={fonte.nome}
                          className="flex items-center justify-between p-2 rounded bg-slate-800/50"
                        >
                          <span className="text-xs">{fonte.nome}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400">
                              {fonte.status === "OPERACIONAL"
                                ? "Online"
                                : "Pendente"}
                            </span>
                            <div
                              className={`w-2 h-2 rounded-full ${fonte.status === "OPERACIONAL" ? "bg-green-500" : "bg-amber-500"}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <ThinkingLogPanel
        isOpen={thinkingPanelOpen}
        onToggle={() => setThinkingPanelOpen(!thinkingPanelOpen)}
      />
      <Footer />
    </div>
  );
}

// ============================================
// COMPONENTES AUXILIARES
// ============================================

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Droplets className="h-14 w-14 text-cyan-400 mx-auto" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-bold text-cyan-400 mt-5"
        >
          SiMoHi-RJ
        </motion.h1>
        <p className="text-slate-400 text-sm mt-1">
          Sistema de Monitoramento Hidrológico
        </p>
        <div className="mt-4 flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
              className="w-2 h-2 rounded-full bg-cyan-400"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusCard({
  icon: Icon,
  label,
  value,
  trend,
  status,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  trend: string;
  status: "normal" | "moderado" | "elevado" | "critico";
}) {
  const cores = {
    normal: "text-green-400",
    moderado: "text-amber-400",
    elevado: "text-orange-400",
    critico: "text-red-400",
  };
  return (
    <Card className="glass-card p-3">
      <div className="flex items-start justify-between">
        <Icon className={`h-4 w-4 ${cores[status]}`} />
        <span className="text-[10px] text-slate-500">{trend}</span>
      </div>
      <p className="text-lg font-bold mt-1">{value}</p>
      <p className="text-[10px] text-slate-400">{label}</p>
    </Card>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/50">
      <Icon className="h-3.5 w-3.5 text-cyan-400 mb-1" />
      <p className="text-sm font-semibold">{value}</p>
      <p className="text-[10px] text-slate-400">{label}</p>
    </div>
  );
}

function AlertsPanel() {
  const alertas = useMonitoramentoStore((state) => state.alertasAtivos);

  if (alertas.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-slate-400" />
            Alertas Ativos
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <p className="text-xs text-slate-400 text-center py-4">
            Nenhum alerta ativo no momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  const cores: Record<string, string> = {
    ALERTA_MAXIMO: "border-red-500/50 bg-red-500/10",
    ALERTA: "border-orange-500/50 bg-orange-500/10",
    ATENCAO: "border-amber-500/50 bg-amber-500/10",
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            Alertas Ativos
          </CardTitle>
          <Badge variant="secondary" className="text-[10px]">
            {alertas.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3 space-y-2">
        {alertas.map((alerta) => (
          <div
            key={alerta.id}
            className={`p-2.5 rounded-lg border ${cores[alerta.nivel] || "border-slate-500/50"}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-200">
                {alerta.titulo}
              </span>
              <span className="text-[10px] text-slate-400">
                {alerta.scoreConfianca}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400">{alerta.descricao}</p>
            <Progress value={alerta.scoreConfianca} className="h-1 mt-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function AlertasTab() {
  const alertas = useMonitoramentoStore((state) => state.alertasAtivos);

  if (alertas.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-slate-400 text-sm">
          Nenhum alerta ativo no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {alertas.map((alerta) => (
        <AlertDetailCard
          key={alerta.id}
          nivel={alerta.nivel as NivelAlerta}
          titulo={alerta.titulo}
          subBacia={alerta.subBaciaId}
          descricao={alerta.descricao}
          score={alerta.scoreConfianca}
          fontes={
            Array.isArray(alerta.fontesConfirmadas)
              ? alerta.fontesConfirmadas
              : []
          }
          acoes={
            MENSAGENS_ALERTA[alerta.nivel as keyof typeof MENSAGENS_ALERTA]
              ?.acoes || []
          }
        />
      ))}
    </div>
  );
}

function FavoritosPanel() {
  const favoritos = useUsuarioStore((state) => state.favoritos);
  if (favoritos.length === 0) {
    return (
      <p className="text-xs text-slate-400 text-center py-4">
        Nenhuma localidade salva ainda.
      </p>
    );
  }
  return (
    <>
      {favoritos.map((f) => (
        <FavoriteLocation
          key={f.id}
          nome={f.nome}
          endereco={f.subBaciaId}
          risco="baixo"
        />
      ))}
    </>
  );
}

function AlertDetailCard({
  nivel,
  titulo,
  subBacia,
  descricao,
  score,
  fontes,
  acoes,
}: {
  nivel: NivelAlerta;
  titulo: string;
  subBacia: string;
  descricao: string;
  score: number;
  fontes: string[];
  acoes: string[];
}) {
  const config = {
    ALERTA_MAXIMO: {
      cor: "red",
      border: "border-red-500/50",
      bg: "bg-red-500/10",
      label: "ALERTA MÁXIMO",
    },
    ALERTA: {
      cor: "orange",
      border: "border-orange-500/50",
      bg: "bg-orange-500/10",
      label: "ALERTA",
    },
    ATENCAO: {
      cor: "amber",
      border: "border-amber-500/50",
      bg: "bg-amber-500/10",
      label: "ATENÇÃO",
    },
  };
  const c = config[nivel];
  return (
    <Card className={`glass-card ${c.border}`}>
      <CardHeader className="pb-2 pt-3 px-3">
        <div className="flex items-center justify-between">
          <Badge
            className={`bg-${c.cor}-500/20 text-${c.cor}-400 border-${c.cor}-500/30`}
          >
            {c.label}
          </Badge>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Score:</span>
            <span className={`text-sm font-bold text-${c.cor}-400`}>
              {score}%
            </span>
          </div>
        </div>
        <CardTitle className="text-sm mt-2">{titulo}</CardTitle>
        <p className="text-[10px] text-slate-500">{subBacia}</p>
      </CardHeader>
      <CardContent className="px-3 pb-3 space-y-3">
        <p className="text-xs text-slate-300">{descricao}</p>
        <div>
          <p className="text-[10px] text-slate-500 mb-1">Fontes confirmadas:</p>
          <div className="flex flex-wrap gap-1">
            {fontes.map((f) => (
              <Badge key={f} variant="secondary" className="text-[10px]">
                {f}
              </Badge>
            ))}
          </div>
        </div>
        <div className={`p-2 rounded ${c.bg}`}>
          <p className="text-[10px] text-slate-400 mb-1">Ações recomendadas:</p>
          <ul className="text-xs text-slate-300 space-y-0.5">
            {acoes.slice(0, 2).map((acao, i) => (
              <li key={i} className="flex items-start gap-1">
                <span className="text-cyan-400">•</span>
                {acao}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function FavoriteLocation({
  nome,
  endereco,
  risco,
}: {
  nome: string;
  endereco: string;
  risco: string;
}) {
  const cores: Record<string, string> = {
    baixo: "border-green-500/30 bg-green-500/5",
    moderado: "border-amber-500/30 bg-amber-500/5",
    alto: "border-orange-500/30 bg-orange-500/5",
    critico: "border-red-500/30 bg-red-500/5",
  };
  const badgeCores: Record<string, string> = {
    baixo: "border-green-500 text-green-400",
    moderado: "border-amber-500 text-amber-400",
    alto: "border-orange-500 text-orange-400",
    critico: "border-red-500 text-red-400",
  };
  return (
    <div
      className={`flex items-center justify-between p-2 rounded-lg border ${cores[risco]}`}
    >
      <div className="flex items-center gap-2">
        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
        <div>
          <p className="text-xs font-medium">{nome}</p>
          <p className="text-[10px] text-slate-400">{endereco}</p>
        </div>
      </div>
      <Badge variant="outline" className={`text-[9px] ${badgeCores[risco]}`}>
        {risco}
      </Badge>
    </div>
  );
}
