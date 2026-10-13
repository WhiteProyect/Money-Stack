// Estado de carga del sitio público mientras el servidor resuelve los datos.

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex min-h-[40vh] max-w-6xl items-center justify-center px-4 py-10"
    >
      <p className="hud hud-accent text-sm">Cargando…</p>
    </div>
  );
}
