// Emite datos estructurados JSON-LD inyectados en el HTML (F6).
// dangerouslySetInnerHTML es seguro aquí: el contenido lo genera el servidor
// desde datos de la API, sin input de usuario sin escapar.

export default function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
