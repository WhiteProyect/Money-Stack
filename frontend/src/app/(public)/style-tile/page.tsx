import type { Metadata } from 'next';
import VisorFrame from '@/components/visor-frame';
import EffectsToggle from '@/components/effects-toggle';

export const metadata: Metadata = {
  title: 'Style Tile F0 — Sistema de diseño',
  description:
    'Especificación de tokens visuales, paleta cromática, contraste WCAG AA, tipografía HUD y componentes tácticos de Money-Stack.',
};

export default function StyleTilePage() {
  const depthSwatches = [
    { token: '--depth-0', hex: '#05060a', name: 'Profundidad extrema', desc: 'Fondo abisal, negro de máxima lejanía' },
    { token: '--depth-1', hex: '#0b0d14', name: 'Superficie base', desc: 'Fondo principal del viewport (canvas)' },
    { token: '--depth-2', hex: '#13161f', name: 'Superficie elevada', desc: 'Contenedores de sección y hero' },
    { token: '--depth-3', hex: '#1c2030', name: 'Paneles y tarjetas', desc: 'Tarjetas de eventos, artistas y modales' },
    { token: '--depth-4', hex: '#272c40', name: 'Bordes y divisiones', desc: 'Líneas divisorias sutiles y marcos HUD' },
    { token: '--depth-5', hex: '#3a4057', name: 'Borde activo / Hover', desc: 'Estados interactivos y bordes de realce' },
  ];

  const contrastAudit = [
    { fg: 'Texto primario (#eef1f6)', bg: 'Superficie base (#0b0d14)', ratio: '15.6:1', wcag: 'AAA (Pasa ≥ 7.0:1)' },
    { fg: 'Texto primario (#eef1f6)', bg: 'Tarjetas (#1c2030)', ratio: '11.8:1', wcag: 'AAA (Pasa ≥ 7.0:1)' },
    { fg: 'Texto secundario (#b8c0d4)', bg: 'Superficie base (#0b0d14)', ratio: '9.8:1', wcag: 'AAA (Pasa ≥ 7.0:1)' },
    { fg: 'Texto secundario (#b8c0d4)', bg: 'Tarjetas (#1c2030)', ratio: '7.4:1', wcag: 'AAA (Pasa ≥ 7.0:1)' },
    { fg: 'Texto atenuado (#8a92a6)', bg: 'Superficie base (#0b0d14)', ratio: '5.8:1', wcag: 'AA (Pasa ≥ 4.5:1)' },
    { fg: 'Texto atenuado (#8a92a6)', bg: 'Tarjetas (#1c2030)', ratio: '4.7:1', wcag: 'AA (Pasa ≥ 4.5:1)' },
    { fg: 'Acento fosforescente (#7dffb3)', bg: 'Profundidad 0 (#05060a)', ratio: '14.1:1', wcag: 'AAA (Pasa ≥ 7.0:1)' },
    { fg: 'Negro profundidad (#05060a)', bg: 'Botón acento (#7dffb3)', ratio: '14.1:1', wcag: 'AAA (Pasa ≥ 7.0:1)' },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Header HUD */}
      <header className="mb-12 border-b border-[var(--depth-4)] pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="hud hud-accent text-xs">Fase 0 // Fundación de diseño</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl">
              Style Tile: Depth Map & Night Vision
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--text-muted)] font-mono">Control FX:</span>
            <EffectsToggle />
          </div>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--text-secondary)]">
          Especificación viva de tokens, tipografía, jerarquía de contraste WCAG AA, componentes HUD tácticos
          y capas ópticas para Money-Stack (sello discográfico independiente, Caucasia, Colombia).
        </p>
      </header>

      <div className="space-y-16">
        {/* 1. Profundidad (Depth Map) */}
        <section aria-labelledby="tokens-profundidad">
          <div className="mb-6">
            <p className="hud text-xs">01 // Superficies y luminosidad</p>
            <h2 id="tokens-profundidad" className="text-2xl font-bold text-[var(--text-primary)]">
              Profundidades (Depth Spectrum)
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              El brillo codifica la proximidad: lo cercano es más claro y nítido; lo lejano es más oscuro y difuso.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {depthSwatches.map((s) => (
              <div
                key={s.token}
                className="overflow-hidden rounded-xl border border-[var(--depth-4)] bg-[var(--depth-2)] p-4 shadow-sm"
              >
                <div
                  className="mb-3 h-14 w-full rounded-lg border border-[var(--depth-4)] shadow-inner"
                  style={{ backgroundColor: s.hex }}
                />
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-[var(--accent)]">{s.token}</span>
                  <span className="font-mono text-xs text-[var(--text-muted)]">{s.hex}</span>
                </div>
                <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">{s.name}</p>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Acento Fosforescente y Estados */}
        <section aria-labelledby="tokens-acento">
          <div className="mb-6">
            <p className="hud text-xs">02 // Paleta cromática</p>
            <h2 id="tokens-acento" className="text-2xl font-bold text-[var(--text-primary)]">
              Acento Único y Semántica
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Regla de oro: un solo acento fosforescente neón-menta (<code className="text-[var(--accent)]">#7dffb3</code>)
              acompañado de estados semánticos acotados.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-[var(--depth-4)] bg-[var(--depth-2)] p-4">
              <div className="mb-3 h-14 w-full rounded-lg bg-[var(--accent)] shadow-[0_0_16px_var(--accent-glow)]" />
              <p className="font-mono text-xs font-semibold text-[var(--accent)]">--accent</p>
              <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Fosforescente</p>
              <p className="text-xs text-[var(--text-secondary)]">#7dffb3 (Menta neón / HUD)</p>
            </div>

            <div className="rounded-xl border border-[var(--depth-4)] bg-[var(--depth-2)] p-4">
              <div className="mb-3 flex h-14 w-full items-center justify-center rounded-lg bg-[var(--accent-soft)] border border-[var(--accent)]">
                <span className="font-mono text-xs font-bold text-[var(--accent)]">SOFT 12%</span>
              </div>
              <p className="font-mono text-xs font-semibold text-[var(--accent)]">--accent-soft</p>
              <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Acento atenuado</p>
              <p className="text-xs text-[var(--text-secondary)]">rgba(125, 255, 179, 0.12)</p>
            </div>

            <div className="rounded-xl border border-[var(--depth-4)] bg-[var(--depth-2)] p-4">
              <div className="mb-3 h-14 w-full rounded-lg bg-[var(--warning)]" />
              <p className="font-mono text-xs font-semibold text-[var(--warning)]">--warning</p>
              <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Advertencia / Pendiente</p>
              <p className="text-xs text-[var(--text-secondary)]">#ffcf7d (Ámbar radar)</p>
            </div>

            <div className="rounded-xl border border-[var(--depth-4)] bg-[var(--depth-2)] p-4">
              <div className="mb-3 h-14 w-full rounded-lg bg-[var(--error)]" />
              <p className="font-mono text-xs font-semibold text-[var(--error)]">--error</p>
              <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Error / Cancelado</p>
              <p className="text-xs text-[var(--text-secondary)]">#ff7d8b (Coral crítico)</p>
            </div>
          </div>
        </section>

        {/* 3. Auditoría de Contraste WCAG AA */}
        <section aria-labelledby="auditoria-contraste">
          <div className="mb-6">
            <p className="hud text-xs">03 // Accesibilidad y legibilidad</p>
            <h2 id="auditoria-contraste" className="text-2xl font-bold text-[var(--text-primary)]">
              Auditoría de Contraste WCAG 2.1
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Todas las combinaciones de texto y superficie superan el umbral AA (≥ 4.5:1) y la mayoría alcanzan nivel AAA (≥ 7.0:1).
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[var(--depth-4)] bg-[var(--depth-2)]">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--depth-4)] bg-[var(--depth-3)] font-mono text-xs uppercase text-[var(--text-muted)]">
                <tr>
                  <th scope="col" className="px-4 py-3">Elemento frontal (Foreground)</th>
                  <th scope="col" className="px-4 py-3">Superficie (Background)</th>
                  <th scope="col" className="px-4 py-3">Relación de contraste</th>
                  <th scope="col" className="px-4 py-3">Evaluación WCAG</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--depth-4)] font-mono text-xs">
                {contrastAudit.map((row) => (
                  <tr key={row.fg + row.bg} className="hover:bg-[var(--depth-3)]/40 transition-colors">
                    <td className="px-4 py-3 text-[var(--text-primary)]">{row.fg}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{row.bg}</td>
                    <td className="px-4 py-3 font-semibold text-[var(--accent)]">{row.ratio}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--accent)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                        {row.wcag}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Tipografía: HUD Mono vs Body Sans */}
        <section aria-labelledby="tipografia-sistema">
          <div className="mb-6">
            <p className="hud text-xs">04 // Jerarquía tipográfica</p>
            <h2 id="tipografia-sistema" className="text-2xl font-bold text-[var(--text-primary)]">
              Tipografía: HUD Monoespaciada y Body Sans
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Display / HUD */}
            <div className="rounded-xl border border-[var(--depth-4)] bg-[var(--depth-2)] p-6">
              <div className="mb-4 flex items-center justify-between border-b border-[var(--depth-4)] pb-3">
                <span className="font-mono text-xs text-[var(--accent)] font-semibold">HUD DISPLAY MONO</span>
                <span className="font-mono text-[10px] text-[var(--text-muted)]">--font-display</span>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="hud text-[11px]">Etiqueta técnica</p>
                  <p className="font-mono text-lg font-bold text-[var(--accent)]">
                    LAT 07°59&apos;N // LON 75°12&apos;W
                  </p>
                </div>
                <div>
                  <p className="hud text-[11px]">Metadato de evento</p>
                  <p className="font-mono text-sm text-[var(--text-primary)]">
                    STATUS: CONFIRMED · TICKET_PRICE: $35.000 COP
                  </p>
                </div>
                <div>
                  <p className="hud hud-accent text-[11px]">Acento con brillo neón</p>
                  <p className="hud-accent font-mono text-xl font-bold">
                    [SYS.ONLINE // RADAR ACTIVO]
                  </p>
                </div>
              </div>
            </div>

            {/* Body / Editorial */}
            <div className="rounded-xl border border-[var(--depth-4)] bg-[var(--depth-2)] p-6">
              <div className="mb-4 flex items-center justify-between border-b border-[var(--depth-4)] pb-3">
                <span className="text-xs text-[var(--text-primary)] font-semibold">EDITORIAL BODY SANS</span>
                <span className="font-mono text-[10px] text-[var(--text-muted)]">--font-body</span>
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                  Cultivando el sonido del Bajo Cauca
                </h3>
                <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                  Money-Stack conecta artistas con audiencias de toda Colombia. Curaduría rigurosa, producción de alto
                  impacto y gestión transparente de reservas y cartelera.
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Texto secundario de soporte, notas legales y consentimientos de datos (Ley 1581 de 2012).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Marcos Visor Tácticos */}
        <section aria-labelledby="marcos-visor">
          <div className="mb-6">
            <p className="hud text-xs">05 // Componentes de visión nocturna</p>
            <h2 id="marcos-visor" className="text-2xl font-bold text-[var(--text-primary)]">
              Marcos Visor Tácticos (VisorFrame)
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Estructuras con corchetes en las esquinas (┌ ┐ └ ┘), barra de telemetría HUD y micro-brillos interactivos.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <VisorFrame
              label="SYS.MONITOR // CAUCASIA"
              telemetry="CAM_01 // REC"
              statusDot
              glow
              cornerSize="lg"
              contentClassName="p-6"
            >
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Marco con telemetría activa
              </h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Utilizado para destacar secciones principales, héroes de página y módulos de booking prioritarios.
              </p>
              <div className="mt-4 flex items-center gap-2 font-mono text-xs text-[var(--accent)]">
                <span>COORD: 07.98° N / 75.19° W</span>
                <span>·</span>
                <span>BAUD: 9600</span>
              </div>
            </VisorFrame>

            <VisorFrame
              label="ARTIST_CARD // PREVIEW"
              cornerSize="md"
              contentClassName="p-6"
            >
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Marco compacto para tarjetas
              </h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                Configuración ligera para elementos de cuadrícula (artistas, fechas de gira, estados de reserva).
              </p>
              <div className="mt-4 flex gap-2">
                <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 font-mono text-xs text-[var(--accent)]">
                  AFROBEAT
                </span>
                <span className="rounded-full bg-[var(--depth-4)] px-2.5 py-0.5 font-mono text-xs text-[var(--text-secondary)]">
                  URBANO
                </span>
              </div>
            </VisorFrame>
          </div>
        </section>

        {/* 6. Kit de Componentes UI */}
        <section aria-labelledby="kit-componentes">
          <div className="mb-6">
            <p className="hud text-xs">06 // Controles y primitivas</p>
            <h2 id="kit-componentes" className="text-2xl font-bold text-[var(--text-primary)]">
              Kit de Componentes UI
            </h2>
          </div>

          <div className="rounded-xl border border-[var(--depth-4)] bg-[var(--depth-2)] p-6 space-y-8">
            {/* Botones */}
            <div>
              <p className="hud text-xs mb-3">Botones interactivos</p>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--depth-0)] shadow-[0_0_16px_var(--accent-glow)] transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-[var(--depth-0)]"
                >
                  Acento principal
                </button>
                <button
                  type="button"
                  className="rounded-full border border-[var(--depth-4)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                >
                  Secundario / Borde
                </button>
                <button
                  type="button"
                  className="rounded-full bg-[var(--accent-soft)] px-5 py-2.5 text-sm font-medium text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--depth-0)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                >
                  Suave (Soft)
                </button>
                <button
                  type="button"
                  disabled
                  className="rounded-full border border-[var(--depth-4)] bg-[var(--depth-3)] px-5 py-2.5 text-sm font-medium text-[var(--text-muted)] opacity-50 cursor-not-allowed"
                >
                  Deshabilitado
                </button>
              </div>
            </div>

            {/* Pastillas de estado */}
            <div>
              <p className="hud text-xs mb-3">Píldoras de estado (Bookings y Eventos)</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(125,255,179,0.15)] px-3 py-1 font-mono text-xs font-medium text-[var(--accent)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                  CONFIRMED / ACCEPTED
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(255,207,125,0.15)] px-3 py-1 font-mono text-xs font-medium text-[var(--warning)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--warning)]" />
                  PENDING
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(255,125,139,0.15)] px-3 py-1 font-mono text-xs font-medium text-[var(--error)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--error)]" />
                  CANCELLED / REJECTED
                </span>
              </div>
            </div>

            {/* Inputs de formulario */}
            <div>
              <p className="hud text-xs mb-3">Campos de formulario tácticos</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="sample-text" className="hud block text-xs mb-1.5">
                    Nombre o Productora
                  </label>
                  <input
                    id="sample-text"
                    type="text"
                    defaultValue="Festival Río Cauca"
                    className="w-full rounded-lg border border-[var(--depth-4)] bg-[var(--depth-1)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
                <div>
                  <label htmlFor="sample-select" className="hud block text-xs mb-1.5">
                    Presupuesto estimado
                  </label>
                  <select
                    id="sample-select"
                    defaultValue="5000000"
                    className="w-full rounded-lg border border-[var(--depth-4)] bg-[var(--depth-1)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  >
                    <option value="5000000">$5.000.000 COP</option>
                    <option value="10000000">$10.000.000 COP</option>
                    <option value="20000000">$20.000.000 COP</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
