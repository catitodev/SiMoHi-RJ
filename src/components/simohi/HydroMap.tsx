'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  ZoomIn,
  ZoomOut,
  AlertTriangle,
  Layers,
  Navigation,
  Crosshair,
  RotateCcw,
  CloudRain,
  Droplets,
  Radio,
  Activity,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MACRORREGIOES, SUB_BACIAS, ESTACOES_REAIS } from '@/lib/constants';
import type { NivelRisco, TipoEstacao, SubBaciaHidrografica, MacrorregiaoAmbiental } from '@/lib/types';

// ============================================
// TIPOS E INTERFACES
// ============================================

interface SensorPopup {
  id: string;
  nome: string;
  fonte: string;
  tipo: string;
  latitude: number;
  longitude: number;
  dados: {
    chuvaAtual?: number;
    nivelRio?: number;
    temperatura?: number;
    umidade?: number;
    timestamp: Date;
  };
}

interface HydroMapProps {
  onMRASelect?: (mra: MacrorregiaoAmbiental | null) => void;
  onSubBaciaSelect?: (subBacia: SubBaciaHidrografica | null) => void;
  modoCidadao?: boolean;
  userLocation?: { lat: number; lng: number } | null;
}

// ============================================
// CONSTANTES
// ============================================

const MAP_LAYERS = [
  { id: 'dark', name: 'Visão Noturna SiMoHi', icon: Activity },
  { id: 'satellite', name: 'Satélite', icon: MapPin },
  { id: 'terrain', name: 'Terreno/Relevo', icon: Layers },
];

const ALERTAS_SIMULADOS = [
  { subBaciaId: 'sb-02', nivel: 'CRITICO' as const },
  { subBaciaId: 'sb-04', nivel: 'ALTO' as const },
  { subBaciaId: 'sb-16', nivel: 'MODERADO' as const },
];

// URL do CartoDB DarkMatter (gratuito, sem chave de API)
const CARTO_DARK_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const ESRI_SATELLITE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const STAMEN_TERRAIN_URL = 'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png';

// Centro do Estado do Rio de Janeiro
const RJ_CENTER: [number, number] = [-22.4, -42.8];
const RJ_DEFAULT_ZOOM = 7;

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function getRiskColor(nivel?: NivelRisco | string): string {
  switch (nivel) {
    case 'CRITICO': return '#ef4444';
    case 'ALTO': return '#f97316';
    case 'MODERADO': return '#fbbf24';
    case 'BAIXO': return '#22c55e';
    default: return '#00d4ff';
  }
}

function getMRACoordinates(mraId: string): number[][][] {
  const coords: Record<string, number[][][]> = {
    'mra-1': [[
      [-43.8, -22.6], [-43.1, -22.6], [-43.0, -22.9], [-43.1, -23.1],
      [-43.5, -23.0], [-43.8, -22.8], [-43.8, -22.6]
    ]],
    'mra-2': [[
      [-44.2, -22.9], [-43.6, -22.9], [-43.5, -23.2], [-43.8, -23.3],
      [-44.2, -23.1], [-44.2, -22.9]
    ]],
    'mra-3': [[
      [-42.0, -21.8], [-41.2, -21.6], [-41.0, -22.0], [-41.5, -22.3],
      [-42.0, -22.1], [-42.0, -21.8]
    ]],
    'mra-4': [[
      [-43.4, -22.2], [-42.8, -22.1], [-42.6, -22.5], [-43.0, -22.8],
      [-43.4, -22.5], [-43.4, -22.2]
    ]],
    'mra-5': [[
      [-42.3, -22.0], [-41.6, -22.0], [-41.5, -22.5], [-42.0, -22.6],
      [-42.3, -22.3], [-42.3, -22.0]
    ]],
    'mra-6': [[
      [-44.5, -22.1], [-43.5, -22.0], [-43.3, -22.6], [-43.8, -22.8],
      [-44.5, -22.5], [-44.5, -22.1]
    ]],
    'mra-7': [[
      [-42.5, -21.5], [-41.5, -21.4], [-41.3, -21.9], [-41.8, -22.1],
      [-42.5, -21.8], [-42.5, -21.5]
    ]],
  };
  return coords[mraId] || [[[0, 0]]];
}

function getMRACenter(mraId: string): [number, number] {
  const centers: Record<string, [number, number]> = {
    'mra-1': [-22.85, -43.3],
    'mra-2': [-23.0, -43.9],
    'mra-3': [-21.9, -41.5],
    'mra-4': [-22.4, -43.1],
    'mra-5': [-22.2, -41.9],
    'mra-6': [-22.4, -44.0],
    'mra-7': [-21.7, -42.0],
  };
  return centers[mraId] || [-22.4, -42.8];
}

function identifyUserSubBacia(lat: number, lng: number): string | null {
  for (const estacao of ESTACOES_REAIS) {
    const dist = Math.sqrt(
      Math.pow(estacao.latitude - lat, 2) +
      Math.pow(estacao.longitude - lng, 2)
    );
    if (dist < 0.3) return estacao.subBaciaId;
  }
  return 'sb-02';
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export function HydroMap({
  onMRASelect,
  onSubBaciaSelect,
  modoCidadao = false,
  userLocation
}: HydroMapProps) {
  // Refs
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const mraLayerRef = useRef<L.LayerGroup | null>(null);
  const subBaciaLayerRef = useRef<L.LayerGroup | null>(null);
  const sensorLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);

  // Estados
  const [isClient, setIsClient] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeLayer, setActiveLayer] = useState<string>('dark');
  const [showLayerSelector, setShowLayerSelector] = useState(false);
  const [zoom, setZoom] = useState(RJ_DEFAULT_ZOOM);
  const [selectedMRA, setSelectedMRA] = useState<string | null>(null);
  const [selectedSubBacia, setSelectedSubBacia] = useState<string | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<SensorPopup | null>(null);
  const [showSensors, setShowSensors] = useState(true);
  const [userSubBacia, setUserSubBacia] = useState<string | null>(null);
  const [L, setL] = useState<typeof import('leaflet') | null>(null);

  // Nível de visualização: <10 = MRAs, 10-14 = Sub-bacias, >=14 = Sensores
  const viewLevel = zoom < 10 ? 'mra' : zoom < 14 ? 'subbacia' : 'sensor';

  // Carregar Leaflet no client
  useEffect(() => {
    setIsClient(true);
    import('leaflet').then(mod => {
      setL(mod.default || mod);
    });
  }, []);

  // Inicializar mapa quando Leaflet carregar
  useEffect(() => {
    if (!isClient || !L || !mapRef.current || leafletMapRef.current) return;
   
    // CSS do Leaflet
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Criar mapa
    const map = L.map(mapRef.current, {
      center: RJ_CENTER,
      zoom: RJ_DEFAULT_ZOOM,
      minZoom: 5,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
    });

    // Tile layer inicial (CartoDB Dark)
    const tileLayer = L.tileLayer(CARTO_DARK_URL, {
      maxZoom: 19,
    }).addTo(map);

    // Layer groups
    const mraLayer = L.layerGroup().addTo(map);
    const subBaciaLayer = L.layerGroup().addTo(map);
    const sensorLayer = L.layerGroup().addTo(map);

    // Evento de zoom
    map.on('zoomend', () => {
      setZoom(map.getZoom());
    });

    // Evento de clique no mapa
    map.on('click', () => {
      setSelectedMRA(null);
      setSelectedSubBacia(null);
      onMRASelect?.(null);
      onSubBaciaSelect?.(null);
    });

    // Salvar refs
    leafletMapRef.current = map;
    tileLayerRef.current = tileLayer;
    mraLayerRef.current = mraLayer;
    subBaciaLayerRef.current = subBaciaLayer;
    sensorLayerRef.current = sensorLayer;

     setTimeout(() => {
       map.invalidateSize();
       setMapLoaded(true);
     }, 500);

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, [L, isClient, onMRASelect, onSubBaciaSelect]);

  // Atualizar tile layer
  useEffect(() => {
    if (!leafletMapRef.current || !tileLayerRef.current || !L) return;

    const urls: Record<string, string> = {
      dark: CARTO_DARK_URL,
      satellite: ESRI_SATELLITE_URL,
      terrain: STAMEN_TERRAIN_URL,
    };

    tileLayerRef.current.setUrl(urls[activeLayer] || CARTO_DARK_URL);
  }, [activeLayer, L]);

  // Atualizar camadas baseado no zoom
  useEffect(() => {
    if (!leafletMapRef.current || !L || !mapLoaded) return;

    const mraLayer = mraLayerRef.current;
    const subBaciaLayer = subBaciaLayerRef.current;
    const sensorLayer = sensorLayerRef.current;

    if (!mraLayer || !subBaciaLayer || !sensorLayer) return;

    // Limpar camadas
    mraLayer.clearLayers();
    subBaciaLayer.clearLayers();
    sensorLayer.clearLayers();

    // Renderizar MRAs (zoom < 10)
    if (viewLevel === 'mra') {
      MACRORREGIOES.forEach(mra => {
        const alerta = ALERTAS_SIMULADOS.find(a =>
          SUB_BACIAS.filter(sb => sb.macrorregiaoId === mra.id).some(sb => sb.id === a.subBaciaId)
        );
        const nivel = alerta?.nivel || 'BAIXO';
        const cor = getRiskColor(nivel);
        const isSelected = selectedMRA === mra.id;

        const polygon = L.polygon(getMRACoordinates(mra.id)[0] as [number, number][], {
          color: isSelected ? '#00d4ff' : cor,
          weight: isSelected ? 3 : 2,
          fillColor: cor,
          fillOpacity: 0.3,
        });

        polygon.on('click', (e: L.LeafletMouseEvent) => {
          L.DomEvent.stopPropagation(e);
          setSelectedMRA(mra.id);
          onMRASelect?.(mra);
          leafletMapRef.current?.flyTo(getMRACenter(mra.id), 10, { duration: 1 });
        });

        polygon.bindPopup(`
          <div style="text-align: center; min-width: 120px;">
            <p style="font-weight: bold; margin: 0;">${mra.codigo}</p>
            <p style="font-size: 12px; margin: 4px 0;">${mra.nome}</p>
            <p style="font-size: 11px; margin: 0; color: ${cor};">Risco: ${nivel}</p>
          </div>
        `);

        polygon.addTo(mraLayer);
      });
    }

    // Renderizar Sub-bacias (zoom 10-14)
    if (viewLevel === 'subbacia') {
      const filteredSubBacias = selectedMRA
        ? SUB_BACIAS.filter(sb => sb.macrorregiaoId === selectedMRA)
        : SUB_BACIAS;

      filteredSubBacias.forEach((sb, index) => {
        const alerta = ALERTAS_SIMULADOS.find(a => a.subBaciaId === sb.id);
        const nivel = alerta?.nivel || sb.nivelRiscoMedio;
        const cor = getRiskColor(nivel);
        const isSelected = selectedSubBacia === sb.id;

        // Posição aproximada baseada no índice
        const center = getMRACenter(sb.macrorregiaoId);
        const offsetLat = (index % 5 - 2) * 0.08;
        const offsetLng = (Math.floor(index / 5) - 1) * 0.1;

        const marker = L.circleMarker([center[0] + offsetLat, center[1] + offsetLng] as [number, number], {
          radius: 15,
          color: isSelected ? '#00d4ff' : cor,
          weight: isSelected ? 3 : 2,
          fillColor: cor,
          fillOpacity: 0.4,
        });

        marker.on('click', (e: L.LeafletMouseEvent) => {
          L.DomEvent.stopPropagation(e);
          setSelectedSubBacia(sb.id);
          onSubBaciaSelect?.(sb);

          // Encontrar estação da sub-bacia
          const estacao = ESTACOES_REAIS.find(est => est.subBaciaId === sb.id);
          if (estacao) {
            leafletMapRef.current?.flyTo([estacao.latitude, estacao.longitude], 14, { duration: 1 });
          }
        });

        marker.bindPopup(`
          <div style="text-align: center; min-width: 150px;">
            <p style="font-weight: bold; margin: 0;">${sb.codigo}</p>
            <p style="font-size: 11px; margin: 4px 0;">${sb.nome}</p>
            <p style="font-size: 10px; margin: 0; color: #94a3b8;">Rio: ${sb.rioPrincipal}</p>
            <p style="font-size: 11px; margin: 4px 0 0; color: ${cor};">Risco: ${nivel}</p>
          </div>
        `);

        marker.addTo(subBaciaLayer);
      });
    }

    // Renderizar Sensores (zoom >= 14)
    if (viewLevel === 'sensor' && showSensors) {
      ESTACOES_REAIS.forEach(estacao => {
        const alerta = ALERTAS_SIMULADOS.find(a => a.subBaciaId === estacao.subBaciaId);
        const nivel = alerta?.nivel || 'BAIXO';
        const cor = getRiskColor(nivel);

        const iconMap: Record<TipoEstacao, string> = {
          PLUVIOMETRICO: '🌧️',
          FLUVIOMETRICO: '💧',
          METEOROLOGICO: '🌡️',
          RADAR: '📡',
        };
        const emoji = iconMap[estacao.tipo as TipoEstacao] || '📍';

        const icon = L.divIcon({
          html: `
            <div style="
              width: 32px;
              height: 32px;
              background: ${cor}40;
              border: 2px solid ${cor};
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              cursor: pointer;
              ${alerta?.nivel === 'CRITICO' ? 'animation: pulse 1.5s infinite;' : ''}
            ">
              ${emoji}
            </div>
          `,
          className: 'custom-sensor-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([estacao.latitude, estacao.longitude], { icon });

        marker.on('click', () => {
          const sensorData: SensorPopup = {
            id: estacao.codigo,
            nome: estacao.nome,
            fonte: estacao.fonte,
            tipo: estacao.tipo,
            latitude: estacao.latitude,
            longitude: estacao.longitude,
            dados: {
              chuvaAtual: Math.random() * 20,
              nivelRio: estacao.tipo === 'FLUVIOMETRICO' ? 1.5 + Math.random() * 2 : undefined,
              temperatura: 20 + Math.random() * 10,
              umidade: 60 + Math.random() * 30,
              timestamp: new Date(),
            },
          };
          setSelectedSensor(sensorData);
        });

        marker.bindPopup(`
          <div style="text-align: center; min-width: 150px;">
            <p style="font-size: 10px; color: #00d4ff; margin: 0;">${estacao.fonte}</p>
            <p style="font-weight: bold; margin: 4px 0;">${estacao.nome}</p>
            <p style="font-size: 10px; color: #94a3b8; margin: 0;">${estacao.tipo}</p>
            <p style="font-size: 11px; margin: 4px 0 0; color: ${cor};">Risco: ${nivel}</p>
          </div>
        `);

        marker.addTo(sensorLayer);
      });
    }

  }, [viewLevel, selectedMRA, selectedSubBacia, showSensors, mapLoaded, L, onMRASelect, onSubBaciaSelect]);

  // Atualizar marcador do usuário
  useEffect(() => {
    if (!leafletMapRef.current || !L || !modoCidadao || !userLocation) return;

    // Remover marcador anterior
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    // Criar novo marcador
    const marker = L.circleMarker([userLocation.lat, userLocation.lng] as [number, number], {
      radius: 12,
      color: '#3b82f6',
      weight: 3,
      fillColor: '#3b82f6',
      fillOpacity: 0.5,
    });

    const userSB = identifyUserSubBacia(userLocation.lat, userLocation.lng);
    setUserSubBacia(userSB);

    marker.bindPopup(`
      <div style="text-align: center;">
        <p style="font-weight: bold; margin: 0;">Sua Localização</p>
        ${userSB ? `<p style="font-size: 11px; color: #00d4ff; margin: 4px 0 0;">Sub-bacia: ${userSB}</p>` : ''}
      </div>
    `);

    marker.addTo(leafletMapRef.current);
    userMarkerRef.current = marker;

    return () => {
      marker.remove();
    };
  }, [userLocation, modoCidadao, L]);

  // Fly to user location
  const flyToUser = useCallback(() => {
    if (userLocation && leafletMapRef.current) {
      leafletMapRef.current.flyTo([userLocation.lat, userLocation.lng], 14, { duration: 1.5 });

      const userSB = identifyUserSubBacia(userLocation.lat, userLocation.lng);
      setUserSubBacia(userSB);

      if (userSB) {
        const subBacia = SUB_BACIAS.find(sb => sb.id === userSB);
        if (subBacia) onSubBaciaSelect?.(subBacia);
      }
    }
  }, [userLocation, onSubBaciaSelect]);

  // Reset view
  const resetView = useCallback(() => {
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo(RJ_CENTER, RJ_DEFAULT_ZOOM, { duration: 1 });
      setSelectedMRA(null);
      setSelectedSubBacia(null);
      setSelectedSensor(null);
      onMRASelect?.(null);
      onSubBaciaSelect?.(null);
    }
  }, [onMRASelect, onSubBaciaSelect]);

  // Loading state removido — mapRef precisa estar sempre no DOM

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-slate-900">
      {/* ============================================ */}
      {/* CONTAINER DO MAPA */}
      {/* ============================================ */}
      <div
        ref={mapRef}
        className="absolute inset-0 h-full w-full"
        style={{ height: '100%', width: '100%' }}
      />
      {(!isClient || !mapLoaded) && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-pulse text-cyan-400 mb-2">Carregando mapa...</div>
            <p className="text-xs text-slate-500">Iniciando Leaflet com CartoDB DarkMatter</p>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* CONTROLES DO MAPA */}
      {/* ============================================ */}

      {/* Seletor de Camadas */}
      <div className="absolute top-3 right-3 z-[1000]">
        <motion.div initial={false} className="relative">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowLayerSelector(!showLayerSelector)}
            className="h-9 bg-slate-800/90 border-slate-700 hover:bg-slate-700"
          >
            <Layers className="h-4 w-4 mr-1.5" />
            <span className="text-xs">Camadas</span>
          </Button>

          <AnimatePresence>
            {showLayerSelector && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-11 right-0 w-48 bg-slate-900/95 rounded-lg border border-slate-700 overflow-hidden shadow-xl"
              >
                {MAP_LAYERS.map(layer => {
                  const Icon = layer.icon;
                  return (
                    <button
                      key={layer.id}
                      onClick={() => {
                        setActiveLayer(layer.id);
                        setShowLayerSelector(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-colors
                        ${activeLayer === layer.id
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'hover:bg-slate-800 text-slate-300'
                        }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {layer.name}
                      {activeLayer === layer.id && (
                        <Badge variant="secondary" className="ml-auto text-[9px]">Ativo</Badge>
                      )}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Indicador de Nível de Zoom */}
      <div className="absolute bottom-20 left-3 z-[1000] bg-slate-900/90 rounded-lg px-3 py-2 border border-slate-700/50">
        <div className="flex items-center gap-3 text-[10px] text-slate-400">
          <span>Zoom: {zoom}</span>
          <span>•</span>
          <span className={`font-medium ${
            viewLevel === 'mra' ? 'text-purple-400' :
            viewLevel === 'subbacia' ? 'text-amber-400' :
            'text-cyan-400'
          }`}>
            {viewLevel === 'mra' ? 'Nível: MRAs' :
             viewLevel === 'subbacia' ? 'Nível: Sub-bacias' :
             'Nível: Sensores'}
          </span>
        </div>
      </div>

      {/* Toggle Sensores */}
      <div className="absolute bottom-3 right-3 z-[1000]">
        <Button
          variant={showSensors ? "default" : "secondary"}
          size="sm"
          onClick={() => setShowSensors(!showSensors)}
          className={`h-8 text-xs ${showSensors ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-slate-800/90'}`}
        >
          <Radio className="h-3 w-3 mr-1" />
          Sensores
        </Button>
      </div>

      {/* Minha Localização */}
      {modoCidadao && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute bottom-3 left-3 z-[1000]"
        >
          <Button
            onClick={flyToUser}
            className="h-10 px-4 bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30"
          >
            <Crosshair className="h-4 w-4 mr-2" />
            Minha Localização
          </Button>
        </motion.div>
      )}

      {/* Reset View */}
      <div className="absolute top-16 left-3 z-[1000]">
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 bg-slate-800/90 border-slate-700"
          onClick={resetView}
          title="Resetar visualização"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* ============================================ */}
      {/* LEGENDA */}
      {/* ============================================ */}
      <div className="absolute top-20 right-3 z-[1000] bg-slate-900/95 rounded-lg p-2.5 border border-slate-700/50">
        <p className="text-[10px] text-slate-400 mb-1.5 font-medium">Níveis de Risco</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[10px] text-slate-300">Crítico</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-[10px] text-slate-300">Alto</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[10px] text-slate-300">Moderado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[10px] text-slate-300">Baixo</span>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* POPUP DO SENSOR (Detalhes) */}
      {/* ============================================ */}
      <AnimatePresence>
        {selectedSensor && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[1001] w-72"
          >
            <div className="glass-card rounded-xl p-4 border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 bg-slate-900/95">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Badge variant="outline" className="border-cyan-500 text-cyan-400 text-[10px] mb-1">
                    {selectedSensor.fonte}
                  </Badge>
                  <h4 className="text-sm font-semibold text-slate-200">{selectedSensor.nome}</h4>
                  <p className="text-[10px] text-slate-500">{selectedSensor.tipo}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setSelectedSensor(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {selectedSensor.dados.chuvaAtual !== undefined && (
                  <div className="p-2 rounded-lg bg-slate-800/50">
                    <CloudRain className="h-3 w-3 text-cyan-400 mb-1" />
                    <p className="text-xs text-slate-400">Chuva</p>
                    <p className="text-sm font-semibold">{selectedSensor.dados.chuvaAtual.toFixed(1)} mm</p>
                  </div>
                )}
                {selectedSensor.dados.nivelRio !== undefined && (
                  <div className="p-2 rounded-lg bg-slate-800/50">
                    <Droplets className="h-3 w-3 text-cyan-400 mb-1" />
                    <p className="text-xs text-slate-400">Nível</p>
                    <p className="text-sm font-semibold">{selectedSensor.dados.nivelRio.toFixed(2)} m</p>
                  </div>
                )}
                {selectedSensor.dados.temperatura !== undefined && (
                  <div className="p-2 rounded-lg bg-slate-800/50">
                    <Activity className="h-3 w-3 text-amber-400 mb-1" />
                    <p className="text-xs text-slate-400">Temp.</p>
                    <p className="text-sm font-semibold">{selectedSensor.dados.temperatura.toFixed(1)}°C</p>
                  </div>
                )}
                {selectedSensor.dados.umidade !== undefined && (
                  <div className="p-2 rounded-lg bg-slate-800/50">
                    <Droplets className="h-3 w-3 text-green-400 mb-1" />
                    <p className="text-xs text-slate-400">Umidade</p>
                    <p className="text-sm font-semibold">{selectedSensor.dados.umidade.toFixed(0)}%</p>
                  </div>
                )}
              </div>

              <p className="text-[9px] text-slate-500 mt-2">
                Última atualização: {selectedSensor.dados.timestamp.toLocaleTimeString('pt-BR')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSS Global para Leaflet */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }
        .custom-sensor-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-container {
          background: #0f172a !important;
          font-family: inherit !important;
        }
        .leaflet-popup-content-wrapper {
          background: rgba(15, 23, 42, 0.95) !important;
          color: #e2e8f0 !important;
          border-radius: 12px !important;
          border: 1px solid rgba(0, 212, 255, 0.3) !important;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
        }
        .leaflet-popup-tip {
          background: rgba(15, 23, 42, 0.95) !important;
        }
        .leaflet-popup-content {
          margin: 12px 16px !important;
        }
      `}</style>
    </div>
  );
}

// Tipo L para evitar erro de importação
type L = typeof import('leaflet');
