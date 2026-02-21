'use client';

import { motion } from 'framer-motion';
import { Droplets, Phone, Heart, Mail, Shield, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-900/90 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        {/* Main Footer Content */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo e Identidade */}
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Droplets className="h-5 w-5 text-cyan-400" />
            </motion.div>
            <div>
              <span className="text-sm font-bold text-cyan-400">SiMoHi-RJ</span>
              <p className="text-[10px] text-slate-500">Sistema de Monitoramento Hidrológico</p>
            </div>
          </div>

          {/* Contato */}
          <div className="flex items-center gap-4">
            <a 
              href="mailto:simohi-rj@proton.me" 
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <Mail className="h-3.5 w-3.5" />
              simohi-rj@proton.me
            </a>
          </div>

          {/* Créditos e Licença */}
          <div className="flex items-center gap-4 text-[10px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <Scale className="h-3 w-3" />
              <span>Licença MIT</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Desenvolvido com</span>
              <Heart className="h-3 w-3 text-red-500 fill-red-500" />
              <span>por</span>
              <span className="text-cyan-400 font-medium">CalangoFlux</span>
            </div>
          </div>
        </div>

        {/* Links Legais */}
        <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-slate-800/50">
          <a href="#" className="text-[10px] text-slate-500 hover:text-cyan-400 transition-colors">
            Termos de Uso
          </a>
          <a href="#" className="text-[10px] text-slate-500 hover:text-cyan-400 transition-colors">
            Política de Privacidade
          </a>
          <a href="#" className="text-[10px] text-slate-500 hover:text-cyan-400 transition-colors">
            Acessibilidade
          </a>
          <div className="flex items-center gap-1 text-[10px] text-slate-500">
            <Shield className="h-3 w-3" />
            <span>Dados Seguros</span>
          </div>
        </div>
      </div>

      {/* Botão de Emergência - Mobile */}
      <div className="sm:hidden fixed bottom-4 right-4 z-50">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 border-2 border-red-400/50"
            size="icon"
          >
            <Phone className="h-5 w-5 text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full" />
          </Button>
        </motion.div>
      </div>
    </footer>
  );
}
