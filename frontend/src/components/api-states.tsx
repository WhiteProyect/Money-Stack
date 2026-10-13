// Estados de UI compartidos cuando la API no responde o no hay datos.

export function ApiUnavailable() {
  return (
    <div className="rounded-xl border border-[var(--depth-4)] bg-[var(--depth-2)] p-8 text-center">
      <p className="hud hud-accent text-sm">Sin señal</p>
      <h2 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
        No pudimos conectar con la API
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-[var(--text-secondary)]">
        El servicio de datos no está respondiendo. Intenta de nuevo en unos
        minutos. Si eres administrador, verifica que el backend esté corriendo.
      </p>
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--depth-4)] bg-[var(--depth-2)] p-10 text-center">
      <p className="hud text-sm">Sin resultados</p>
      <h2 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
      {hint && <p className="mx-auto mt-2 max-w-md text-sm text-[var(--text-secondary)]">{hint}</p>}
    </div>
  );
}
