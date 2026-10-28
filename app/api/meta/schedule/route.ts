import { sendScheduleEvent, isTrackingEnabled, metaCreds } from '@/lib/server/metaEvents'
import { getClientContext } from '@/lib/server/requestContext'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v ? v : undefined
}

interface ScheduleCustomer {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  city?: string
  countryCode?: string
}

/**
 * Fires the custom `schedule_event` once Calendly confirms the booking —
 * triggered by the embed's `calendly.event_scheduled` postMessage on
 * /confirmed(-plus), with /thank-you as a fallback for a Calendly redirect.
 *
 * Both triggers send the Calendly invitee UUID, which becomes the event_id,
 * so one booking is counted once whichever path (or both) reports it.
 */
export async function POST(req: Request): Promise<Response> {
  let body: Record<string, unknown> = {}
  try {
    body = (await req.json()) as Record<string, unknown>
  } catch {
    body = {}
  }

  if (!isTrackingEnabled()) {
    return json(200, { ok: true, skipped: 'test_mode' })
  }

  const creds = metaCreds()
  if (!creds) {
    console.log('[schedule_event] skipped: env_missing')
    return json(200, { ok: true, skipped: 'env_missing' })
  }

  const customer = (body.customer ?? {}) as ScheduleCustomer
  const inviteeId = (str(body.inviteeId) ?? '').replace(/[^A-Za-z0-9-]/g, '').slice(0, 64)
  const ctx = getClientContext(req, { fbc: str(body.fbc), fbp: str(body.fbp) })

  const result = await sendScheduleEvent(
    creds,
    ctx,
    {
      email: customer.email,
      phone: customer.phone,
      firstName: customer.firstName,
      lastName: customer.lastName,
      city: customer.city,
      countryCode: customer.countryCode,
    },
    inviteeId,
    str(body.eventSourceUrl),
  )

  if (result.ok) {
    console.log('[schedule_event] sent')
    return json(200, { ok: true, capi: 'sent' })
  }
  console.error('[schedule_event] failed', result.status, result.body.slice(0, 300))
  return json(200, { ok: true, capi: 'error' })
}
