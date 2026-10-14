import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Datos Personales // Money-Stack',
  description:
    'Cómo Money-Stack recoge, usa y protege tus datos personales conforme a la Ley 1581 de 2012 de Colombia.',
};

const SECTIONS = [
  {
    title: '1. Responsable del tratamiento',
    body: 'Money-Stack (sello discográfico independiente con base en Caucasia, Antioquia, Colombia) es responsable del tratamiento de los datos personales que recabas mediante este sitio, en especial a través del formulario de booking.',
  },
  {
    title: '2. Datos que recogemos',
    body: 'En el formulario de booking recogemos: nombre de contacto, correo electrónico, teléfono, organización (opcional), tipo de evento, fecha del evento, ciudad, venue (opcional), presupuesto (opcional) y el mensaje con los detalles de la solicitud. Además registramos la dirección IP y la fecha de envío, por seguridad y para prevenir abuso.',
  },
  {
    title: '3. Finalidad del tratamiento',
    body: 'Usamos estos datos exclusivamente para: (i) evaluar y responder tu solicitud de booking, (ii) coordinar logística y contractual del evento solicitado, y (iii) mantener un registro interno de solicitudes. No usamos tus datos para marketing sin tu consentimiento expreso.',
  },
  {
    title: '4. Consentimiento (Ley 1581 de 2012)',
    body: 'El envío del formulario exige una casilla de consentimiento expreso e informado. Sin esa autorización no tratamos tus datos. Puedes retirar tu consentimiento en cualquier momento escribiéndonos; haremos efectiva la retirada sin que ello afecte la licitud del tratamiento previo.',
  },
  {
    title: '5. Encargados y transferencias',
    body: 'Los datos se almacenan en nuestra base de datos y en infraestructura de terceros proveedores tecnológicos que actúan como encargados bajo contrato. No vendemos ni cedemos tus datos a terceros con fines comerciales.',
  },
  {
    title: '6. Conservación',
    body: 'Conservamos las solicitudes mientras sean necesarias para atender el proceso de booking y la eventual relación contractual, y luego durante los plazos que exija la normativa contable y tributaria. Transcurridos esos plazos, anonimizamos o eliminamos los datos personales.',
  },
  {
    title: '7. Derechos ARCO y consultas',
    body: 'Tienes derecho a conocer, actualizar, rectificar y suprimir tus datos (derechos ARCO), así como a revocar el consentimiento otorgado, conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013. Para ejercerlos, envía tu solicitud a través de nuestras redes oficiales indicando el derecho que deseas ejercer y el correo con el que te registraste.',
  },
  {
    title: '8. Seguridad',
    body: 'Aplicamos medidas técnicas y organizativas razonables para proteger tus datos: acceso restringido, cifrado en tránsito (HTTPS) y separación entre el sitio público y el panel administrativo. Ningún sistema es infalible; si detectas un incidente, contáctanos.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6 font-mono">
      <header className="rounded-xl border border-[#00ff87]/30 bg-[#090c12] p-6 sm:p-10 shadow-2xl">
        <div className="inline-flex items-center gap-2 rounded bg-black/80 border border-[#00ff87]/40 px-2.5 py-1 text-xs font-black text-[#00ff87]">
          <span>// LEY 1581 DE 2012 // REPÚBLICA DE COLOMBIA</span>
        </div>
        <h1 className="mt-2 text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
          Tratamiento de Datos Personales
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
          En Money-Stack protegemos la privacidad y los derechos de los organizadores, artistas y usuarios.
          Revisa nuestras políticas oficiales de tratamiento y seguridad de la información.
        </p>
      </header>

      <div className="rounded-xl border border-white/10 bg-[#090c12] p-6 sm:p-8 space-y-6">
        {SECTIONS.map((s) => (
          <section key={s.title} className="border-b border-white/5 pb-5 last:border-b-0 last:pb-0">
            <h2 className="text-sm font-bold uppercase text-[#00ff87]">{s.title}</h2>
            <p className="mt-1.5 leading-relaxed text-xs text-slate-300 font-sans">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
