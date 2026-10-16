// Local Suvidhi photos (resized to ~1600px, ~250KB each)
const LOCAL = '/images/suvidhi'

// Legacy remote assets — kept for any place that hasn't been swapped yet.
const REMOTE = 'https://suvidhi.innohealth.co.in/wp-content/uploads'

export const ASSETS = {
  // Hero graphic — the four concern areas the programme works on, shown as a
  // left-to-right progression. Occupies the slot a VSL would take.
  heroThumbnail: `${LOCAL}/postpartum-focus-areas.png`,

  // Primary clinician photos
  heroPortrait: `${LOCAL}/dsc00257.jpg`,
  clinicianPortrait: `${LOCAL}/dsc00293.jpg`,
  bookACallPortrait: `${LOCAL}/dsc00317.jpg`,
  thankYouPortrait: `${LOCAL}/dsc00446.jpg`,
  // Secondary / extras
  portraitA: `${LOCAL}/dsc00167.jpg`,
  portraitB: `${LOCAL}/dsc00371.jpg`,
  portraitC: `${LOCAL}/dsc00467.jpg`,

  // Legacy mockup / decoratives kept around for backwards compat.
  heroMockup: `${REMOTE}/2026/02/mockup-2-1.png`,
  testimonialMahesh: `${REMOTE}/2026/02/image-3006-1.png`,
  testimonialSalila: `${REMOTE}/2026/02/image-3006-2.png`,
  testimonialShashi: `${REMOTE}/2026/02/image-3006-3.png`,
  testimonialPabir: `${REMOTE}/2026/02/image-3006-4.png`,
  badge: `${REMOTE}/2026/02/Rectangle-2-1.png`,
} as const
