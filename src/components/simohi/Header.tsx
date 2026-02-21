'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Settings, 
  User, 
  Menu, 
  X, 
  Droplets,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { useMonitoramentoStore, useUsuarioStore } from '@/store/simohi-store';

export function Header() {
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const { alertasAtivos, modoCidadao, toggleModoCidadao } = useMonitoramentoStore();
  const { nome, role } = useUsuarioStore();

  const alertasCriticos = alertasAtivos.filter(a => a.nivel === 'ALERTA_MAXIMO').length;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-500/20 bg-slate-900/95 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="relative"
            >
              <Droplets className="h-7 w-7 text-cyan-400" />
              <div className="absolute inset-0 bg-cyan-400/20 blur-lg rounded-full" />
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-cyan-400">SiMoHi-RJ</h1>
              <p className="text-[10px] text-slate-400 -mt-0.5">Monitoramento Hidrológico</p>
            </div>
          </div>

          {/* Status APIs - Desktop */}
          <div className="hidden lg:flex items-center gap-1.5">
            <StatusDot fonte="INMET" status="ok" />
            <StatusDot fonte="CEMADEN" status="ok" />
            <StatusDot fonte="INEA" status="warning" />
            <StatusDot fonte="AlertaRio" status="ok" />
          </div>

          {/* Ações */}
          <div className="flex items-center gap-2">
            {/* Alertas Críticos - só mostra se houver */}
            {alertasCriticos > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/40"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                <span className="text-xs font-medium text-red-400">{alertasCriticos}</span>
              </motion.div>
            )}

            {/* Modo Cidadão */}
            <Button
              variant={modoCidadao ? "default" : "outline"}
              size="sm"
              onClick={toggleModoCidadao}
              className={`h-8 gap-1.5 ${
                modoCidadao 
                  ? 'bg-cyan-500 text-slate-900 hover:bg-cyan-400' 
                  : 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Cidadão</span>
              {modoCidadao && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              )}
            </Button>

            {/* Notificações */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                  <Bell className="h-4 w-4" />
                  {alertasAtivos.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white">
                      {alertasAtivos.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <div className="p-3">
                  <p className="text-sm font-medium">Notificações</p>
                  {alertasAtivos.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-3">
                      Nenhum alerta ativo
                    </p>
                  ) : (
                    <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto">
                      {alertasAtivos.slice(0, 5).map((alerta) => (
                        <div
                          key={alerta.id}
                          className="p-2 rounded-md text-xs bg-slate-800/50"
                        >
                          <p className="font-medium truncate">{alerta.titulo}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  {nome} ({role})
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs text-muted-foreground">
                  Configurações
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Menu Mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 lg:hidden"
              onClick={() => setMenuMobileAberto(!menuMobileAberto)}
            >
              {menuMobileAberto ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Menu Mobile Expandido */}
        <AnimatePresence>
          {menuMobileAberto && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t border-cyan-500/10"
            >
              <div className="py-3 flex flex-wrap gap-1.5">
                <StatusDot fonte="INMET" status="ok" showLabel />
                <StatusDot fonte="CEMADEN" status="ok" showLabel />
                <StatusDot fonte="INEA" status="warning" showLabel />
                <StatusDot fonte="AlertaRio" status="ok" showLabel />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

// Componente de Status da API simplificado
function StatusDot({ fonte, status, showLabel = false }: { 
  fonte: string; 
  status: 'ok' | 'warning' | 'error';
  showLabel?: boolean;
}) {
  const cores = {
    ok: 'bg-green-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
  };

  return (
    <div className={`flex items-center gap-1.5 ${showLabel ? 'px-2 py-1 rounded-full bg-slate-800/50' : ''}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${cores[status]} animate-pulse`} />
      {showLabel && <span className="text-[10px] text-slate-400">{fonte}</span>}
    </div>
  );
}
