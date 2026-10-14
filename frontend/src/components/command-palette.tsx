'use client';

// Tactical Studio Command Palette (Ctrl+K / Cmd+K)
// Menú de comandos estilo consola militar/estudio para navegación instantánea y atajos.

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SHOWCASE_ARTISTS, SHOWCASE_EVENTS } from '@/lib/showcase-data';

interface CommandItem {
  id: string;
  category: 'PÁGINAS' | 'ARTISTAS' | 'SHOWS' | 'COMANDOS';
  title: string;
  subtitle?: string;
  action: () => void;
  badge?: string;
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Atajo de teclado global Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIdx(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Lista base de comandos
  const items: CommandItem[] = [
    {
      id: 'p-inicio',
      category: 'PÁGINAS',
      title: 'Inicio // Portada',
      subtitle: 'Hero, beatmaker y cartel principal',
      action: () => router.push('/'),
    },
    {
      id: 'p-artistas',
      category: 'PÁGINAS',
      title: 'Cartel de Artistas',
      subtitle: 'Catálogo de firmas oficiales',
      action: () => router.push('/artistas'),
    },
    {
      id: 'p-eventos',
      category: 'PÁGINAS',
      title: 'Agenda de Shows',
      subtitle: 'Fechas en tarima y festivales',
      action: () => router.push('/eventos'),
    },
    {
      id: 'p-booking',
      category: 'PÁGINAS',
      title: 'Solicitud de Booking',
      subtitle: 'Contrataciones y cotización de riders',
      badge: 'DIRECTO',
      action: () => router.push('/booking'),
    },
    {
      id: 'p-sello',
      category: 'PÁGINAS',
      title: 'El Sello // Manifiesto',
      subtitle: 'Historia de Money-Stack en Caucasia',
      action: () => router.push('/el-sello'),
    },
    // Artistas
    ...SHOWCASE_ARTISTS.map((a) => ({
      id: `a-${a.slug}`,
      category: 'ARTISTAS' as const,
      title: a.name,
      subtitle: a.genres.join(' · '),
      badge: a.isFeatured ? 'TOP' : undefined,
      action: () => router.push(`/artistas/${a.slug}`),
    })),
    // Eventos
    ...SHOWCASE_EVENTS.map((e) => ({
      id: `e-${e.slug}`,
      category: 'SHOWS' as const,
      title: e.title,
      subtitle: `${e.venueName} · ${e.city}`,
      action: () => router.push(`/eventos/${e.slug}`),
    })),
  ];

  const filtered = items.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleSelect = (item: CommandItem) => {
    setIsOpen(false);
    item.action();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const current = filtered[selectedIdx];
      if (current) handleSelect(current);
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="hidden md:inline-flex items-center gap-2 rounded border border-white/15 bg-black/60 px-2.5 py-1 text-[10px] font-mono font-bold text-slate-400 hover:border-white/40 hover:text-white transition-all"
        title="Buscar o comandos rápidos (Ctrl+K)"
      >
        <span className="text-slate-500">BUSCAR</span>
        <kbd className="rounded bg-white/10 px-1 py-0.5 text-[9px] text-slate-300">Ctrl+K</kbd>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 bg-black/80 backdrop-blur-md font-mono animate-fadeIn"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-xl border border-white/20 bg-[#07090e] shadow-[0_25px_60px_rgba(0,0,0,0.95)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra de Búsqueda */}
        <div className="relative border-b border-white/10 p-3.5 bg-black/80 flex items-center gap-3">
          <span className="text-white text-xs font-black">&gt;_</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIdx(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="BUSCAR ARTISTA, SHOW O COMANDO..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none uppercase tracking-wider"
          />
          <kbd className="rounded bg-white/10 border border-white/15 px-1.5 py-0.5 text-[9px] text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Resultados */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-white/5">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              NO SE ENCONTRARON RESULTADOS
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIdx;

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIdx(idx)}
                  className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.2)]'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span
                      className={`text-[9px] font-bold uppercase rounded px-1.5 py-0.5 ${
                        isSelected
                          ? 'bg-black text-white'
                          : 'bg-black/90 border border-white/15 text-slate-400'
                      }`}
                    >
                      {item.category}
                    </span>
                    <div className="truncate">
                      <p className={`text-xs font-black uppercase truncate ${isSelected ? 'text-black' : 'text-white'}`}>
                        {item.title}
                      </p>
                      {item.subtitle && (
                        <p className={`text-[10px] font-sans truncate ${isSelected ? 'text-slate-700' : 'text-slate-400'}`}>
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[8px] font-black uppercase rounded px-1.5 py-0.5 ml-2 ${
                        isSelected ? 'bg-black text-white' : 'bg-white/15 text-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pie de Ayuda */}
        <div className="flex items-center justify-between border-t border-white/10 bg-black/60 px-3.5 py-2 text-[10px] text-slate-500">
          <span>NAVEGAR CON FLECHAS [↑↓] Y SELECCIONAR CON [ENTER]</span>
          <span>MONEY-STACK CONSOLE</span>
        </div>
      </div>
    </div>
  );
}
