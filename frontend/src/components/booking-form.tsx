'use client';

// Formulario de booking (F4).
// - Validación en cliente con zod (espejo del backend) + error.details por campo.
// - Honeypot `website`: campo oculto que los bots rellenan; el backend responde
//   201 igual y descarta la solicitud.
// - consentData: obligatorio (Ley 1581 de Colombia), enlaza a la política.

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { publicPost, ApiError, type ApiErrorDetail } from '@/lib/api';

const bookingSchema = z
  .object({
    requesterName: z.string().trim().min(2, 'El nombre es obligatorio').max(120),
    email: z.string().trim().toLowerCase().email('Correo inválido').max(254),
    phone: z.string().trim().min(7, 'El teléfono es obligatorio').max(30),
    organization: z.string().trim().max(120).nullable().optional(),
    eventType: z.string().trim().min(2, 'El tipo de evento es obligatorio').max(80),
    eventDate: z
      .string()
      .refine((v) => !isNaN(Date.parse(v)), { message: 'Fecha inválida' })
      // La fecha sin hora cuenta en horario de Colombia (UTC-5), igual que el backend.
      .refine((v) => new Date(`${v}T00:00:00-05:00`).getTime() > Date.now(), {
        message: 'La fecha del evento debe ser futura',
      }),
    city: z.string().trim().min(2, 'La ciudad es obligatoria').max(80),
    venue: z.string().trim().max(160).nullable().optional(),
    budget: z
      .string()
      .optional()
      .refine((v) => v === undefined || v === '' || /^[\d.,\s$]+$/.test(v.trim()), {
        message: 'El presupuesto debe ser un número mayor o igual a 0',
      }),
    message: z
      .string()
      .trim()
      .min(20, 'El mensaje debe tener al menos 20 caracteres')
      .max(2000, 'El mensaje no puede superar los 2000 caracteres'),
    consentData: z.literal(true, {
      errorMap: () => ({
        message: 'Debes aceptar el tratamiento de datos (Ley 1581 de Colombia)',
      }),
    }),
    // El select vacío envía '' (= sin preferencia); solo un UUID es válido si hay valor.
    artistId: z
      .union([z.literal(''), z.string().uuid('Selecciona un artista válido')])
      .nullable()
      .optional(),
    website: z.string().optional(), // honeypot
  })
  .strict();

type BookingInput = z.input<typeof bookingSchema>;

interface ArtistOption {
  id: string;
  name: string;
}

// Convierte [{field, message}] del backend en un mapa campo -> mensaje.
// El backend puede anteponer el nombre del esquema ('consentData.consentData'),
// así que nos quedamos con el último segmento del path.
function detailsToRecord(details: ApiErrorDetail[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const d of details) {
    const key = d.field.includes('.') ? d.field.split('.').pop()! : d.field;
    if (!(key in map)) map[key] = d.message;
  }
  return map;
}

const inputCls =
  'w-full rounded-lg border border-[var(--depth-4)] bg-[var(--depth-1)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]';

function Field({
  id,
  label,
  error,
  hint,
  children,
  required,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="hud text-xs">
        {label}
        {required && (
          <span className="ml-1 text-[var(--accent)]" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-[var(--text-muted)]">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-[var(--color-error,#ff7d8b)]">
          {error}
        </p>
      )}
    </div>
  );
}

export default function BookingForm({
  artists,
  defaultArtistId,
}: {
  artists: ArtistOption[];
  defaultArtistId?: string | null;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [serverDetails, setServerDetails] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      requesterName: '',
      email: '',
      phone: '',
      organization: '',
      eventType: '',
      eventDate: '',
      city: '',
      venue: '',
      budget: '',
      message: '',
      consentData: false as unknown as true, // se controla con register manual
      artistId: defaultArtistId ?? null,
      website: '',
    },
  });

  async function onSubmit(values: BookingInput) {
    setServerError(null);
    setServerDetails({});

    try {
      await publicPost('/bookings', {
        ...values,
        organization: values.organization || null,
        venue: values.venue || null,
        // El backend interpreta formatos como "50.000" (miles con punto).
        budget: values.budget?.trim() ? values.budget.trim() : null,
        artistId: values.artistId || null,
      });
      setSuccess(true);
      reset();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'VALIDATION_ERROR' && err.details?.length) {
          setServerDetails(detailsToRecord(err.details));
          setServerError('Revisa los campos marcados: algunos datos no son válidos.');
        } else {
          setServerError(err.message);
        }
      } else {
        setServerError('No se pudo enviar la solicitud. Intenta de nuevo en unos minutos.');
      }
    }
  }

  if (success) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-[var(--accent-soft)] bg-[var(--depth-2)] p-10 text-center"
      >
        <p className="hud hud-accent text-sm">Solicitud enviada</p>
        <h2 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
          Recibimos tu solicitud
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[var(--text-secondary)]">
          Nuestro equipo la revisará y te responderá al correo que nos
          diste. Gracias por escribirnos.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-6 rounded-full border border-[var(--depth-4)] px-5 py-2.5 text-sm text-[var(--text-primary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
        >
          Enviar otra solicitud
        </button>
      </div>
    );
  }

  const err = (name: keyof BookingInput): string | undefined =>
    (errors[name]?.message as string | undefined) ?? serverDetails[name as string];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-2xl border border-[var(--depth-4)] bg-[var(--depth-2)] p-6 md:p-8"
    >
      {serverError && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-[var(--color-error,#ff7d8b)] bg-[rgba(255,125,139,0.08)] p-4 text-sm text-[var(--text-primary)]"
        >
          {serverError}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <Field id="requesterName" label="Nombre de contacto" error={err('requesterName')} required>
          <input
            id="requesterName"
            type="text"
            autoComplete="name"
            aria-invalid={Boolean(errors.requesterName)}
            aria-describedby={errors.requesterName ? 'requesterName-error' : undefined}
            className={inputCls}
            {...register('requesterName')}
          />
        </Field>

        <Field id="email" label="Correo electrónico" error={err('email')} required>
          <input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className={inputCls}
            {...register('email')}
          />
        </Field>

        <Field id="phone" label="Teléfono / WhatsApp" error={err('phone')} required>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            className={inputCls}
            {...register('phone')}
          />
        </Field>

        <Field id="organization" label="Organización" error={err('organization')} hint="Opcional">
          <input
            id="organization"
            type="text"
            autoComplete="organization"
            className={inputCls}
            {...register('organization')}
          />
        </Field>

        <Field id="eventType" label="Tipo de evento" error={err('eventType')} required>
          <input
            id="eventType"
            type="text"
            placeholder="Festival, fiesta privada, gira…"
            aria-invalid={Boolean(errors.eventType)}
            aria-describedby={errors.eventType ? 'eventType-error' : undefined}
            className={inputCls}
            {...register('eventType')}
          />
        </Field>

        <Field id="eventDate" label="Fecha del evento" error={err('eventDate')} required>
          <input
            id="eventDate"
            type="date"
            aria-invalid={Boolean(errors.eventDate)}
            aria-describedby={errors.eventDate ? 'eventDate-error' : undefined}
            className={inputCls}
            {...register('eventDate')}
          />
        </Field>

        <Field id="city" label="Ciudad" error={err('city')} required>
          <input
            id="city"
            type="text"
            aria-invalid={Boolean(errors.city)}
            aria-describedby={errors.city ? 'city-error' : undefined}
            className={inputCls}
            {...register('city')}
          />
        </Field>

        <Field id="venue" label="Venue" error={err('venue')} hint="Opcional">
          <input id="venue" type="text" className={inputCls} {...register('venue')} />
        </Field>

        <Field
          id="budget"
          label="Presupuesto (COP)"
          error={err('budget')}
          hint="Opcional, en pesos colombianos"
        >
          <input id="budget" type="text" inputMode="numeric" className={inputCls} {...register('budget')} />
        </Field>

        <Field id="artistId" label="Artista de interés" error={err('artistId')} hint="Opcional">
          <select id="artistId" className={inputCls} {...register('artistId')}>
            <option value="">El sello decide / sin preferencia</option>
            {artists.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-5">
        <Field
          id="message"
          label="Detalles de la solicitud"
          error={err('message')}
          hint="Cuenta sobre el evento, aforo esperado, horario y referencias. Mínimo 20 caracteres."
          required
        >
          <textarea
            id="message"
            rows={6}
            maxLength={2000}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? 'message-error' : 'message-hint'}
            className={`${inputCls} resize-y`}
            {...register('message')}
          />
        </Field>
      </div>

      {/* Honeypot: oculto para humanos, visible para bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">No completes este campo</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>

      <div className="mt-6 flex items-start gap-3">
        <input
          id="consentData"
          type="checkbox"
          className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]"
          aria-invalid={Boolean(errors.consentData)}
          aria-describedby={errors.consentData ? 'consentData-error' : undefined}
          {...register('consentData')}
        />
        <div>
          <label htmlFor="consentData" className="text-sm text-[var(--text-secondary)]">
            Acepto el tratamiento de mis datos personales conforme a la{' '}
            <Link
              href="/politica-de-datos"
              className="text-[var(--accent)] underline underline-offset-2"
              target="_blank"
            >
              política de datos personales
            </Link>{' '}
            (Ley 1581 de Colombia).*
          </label>
          {errors.consentData && (
            <p id="consentData-error" role="alert" className="mt-1 text-xs text-[var(--color-error,#ff7d8b)]">
              {errors.consentData.message as string}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[var(--depth-0)] shadow-[0_0_16px_var(--accent-glow)] transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-[var(--depth-0)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Enviando…' : 'Enviar solicitud'}
        {!isSubmitting && (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        )}
      </button>
    </form>
  );
}
