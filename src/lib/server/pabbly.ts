/**
 * Server-side Pabbly Connect webhook — writes ONE CRM row per lead at purchase.
 *
 * The 23 auto-fill identifier fields (cols A–W in the SDP-style CRM Sheet) carry
 * everything the downstream Apps Script needs to fire high-EMQ events later. The
 * 9 lifecycle placeholder fields (cols X–AF) are sent EMPTY so Pabbly keeps its
 * column mapping stable; the sales team + Apps Script fill them in afterwards.
 *
 * This funnel has exactly TWO downstream events (set in apps-script/Code.gs):
 *   • QualifiedLead       (qualified ✓)            — no value
 *   • HighTicketPurchase  (sale_closed ✓ + value)  — contracted_value, INR
 */

export interface PabblyRowInput {
  leadId: string
  createdAt: string
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  /** 2-letter ISO (e.g. "IN"). */
  countryCode: string
  fbc: string
  fbp: string
  clientIp: string
  clientUserAgent: string
  /** sha256(lowercased email) — must match CAPI + browser MAM. */
  externalId: string
  /** Host-only origin. */
  eventSourceUrl: string
  amount: number
  isTest: boolean
  /** Equals the CAPI event_id = payment_id. */
  purchaseEventId: string
  utmSource: string
  utmMedium: string
  utmCampaign: string
  utmContent: string
  utmTerm: string
  fbclid: string
}

export interface PabblyResult {
  ok: boolean
  status: number
}

/**
 * POST the enriched 32-column row to the Pabbly webhook. Returns a result;
 * never throws (analytics must not break the payment response).
 */
export async function sendPabblyRow(
  webhookUrl: string,
  input: PabblyRowInput,
): Promise<PabblyResult> {
  if (!webhookUrl) return { ok: false, status: 0 }

  const row = {
    // ── A–W · auto-fill identifiers ──
    lead_id: input.leadId,
    created_at: input.createdAt,
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email,
    phone: input.phone,
    city: input.city,
    country_code: input.countryCode,
    fbc: input.fbc,
    fbp: input.fbp,
    client_ip_address: input.clientIp,
    client_user_agent: input.clientUserAgent,
    external_id: input.externalId,
    event_source_url: input.eventSourceUrl,
    amount: input.amount,
    is_test: input.isTest ? 'true' : 'false',
    purchase_event_id: input.purchaseEventId,
    utm_source: input.utmSource,
    utm_medium: input.utmMedium,
    utm_campaign: input.utmCampaign,
    utm_content: input.utmContent,
    utm_term: input.utmTerm,
    fbclid: input.fbclid,
    // ── X–AA · QualifiedLead lifecycle (sales team + Apps Script) ──
    qualified: '',
    qualified_time: '',
    qualified_capi_event_id: '',
    qualified_capi_sent: '',
    // ── AB–AF · HighTicketPurchase lifecycle (sales team + Apps Script) ──
    sale_closed: '',
    contracted_value: '',
    sales_time: '',
    htsale_capi_event_id: '',
    htsale_capi_sent: '',
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row),
    })
    return { ok: res.ok, status: res.status }
  } catch {
    return { ok: false, status: 0 }
  }
}
