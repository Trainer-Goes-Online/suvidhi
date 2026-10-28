/**
 * Client results — the single source of truth.
 *
 * Shared by the landing page's Results section and the post-booking page, so
 * the same story can never drift between the two. Edit here, nowhere else.
 *
 * PENDING FROM THE CLIENT (blocking, dev spec Part 6 items 2 & 3):
 *  • `meta` (age · profession · city) for all three. Deliberately left
 *    undefined rather than shipping "[AGE] · [PROFESSION] · [CITY]" — the row
 *    simply doesn't render until the real detail arrives.
 *  • Samia's actual before/after figures, so her weight tile can carry numbers
 *    the way Shachi's and Subhuti's already do.
 */

export interface Stat {
  value: string
  label: string
}

export interface Review {
  name: string
  /** "26 · Corporate Lawyer · Faridabad" — pending from the client. */
  meta?: string
  result: string
  story: string
  /** One-line pull quote for compact placements (e.g. the thank-you page). */
  short: string
  stats: Stat[]
}

export interface ImageReview extends Review {
  image: string
}

export interface VideoReview extends Review {
  video: string
  poster: string
}

export const imageReviews: ImageReview[] = [
  {
    name: 'Shachi',
    image: '/images/shachi.jpg',
    result: '75.55 → 62.6 kg',
    story:
      'Reports came back normal while her hair kept falling out through every single wash, still breastfeeding, thyroid sitting borderline. Working with Suvidhi she came down from 75.55 kg to 62.6 kg, brought her thyroid markers back into range and stopped the hair fall completely. Nothing in her protocol asked her to stop feeding.',
    short:
      'Her reports read normal while her hair kept falling out. Thyroid back in range, hair fall stopped — and she never stopped feeding.',
    stats: [
      { value: '75.55 → 62.6 kg', label: 'Weight' },
      { value: 'Back in range', label: 'Thyroid markers' },
      { value: 'Stopped', label: 'Hair fall' },
    ],
  },
  {
    name: 'Samia Nehal',
    image: '/images/samia-nehal.jpg',
    result: 'Sustained weight loss',
    story:
      'Wanted to lose the weight without a plan she would quit in nine days. Her protocol was built around her food, her family’s food and her Ramadan schedule. Nothing removed, things reordered. The weight came off, her energy came back, and she is still eating what she was eating.',
    short:
      'Built around her food, her family’s food and her Ramadan schedule. Nothing removed — things reordered.',
    stats: [
      { value: 'Sustained', label: 'Weight loss' },
      { value: 'Restored', label: 'Energy' },
      { value: 'No restriction', label: 'Approach' },
    ],
  },
]

export const videoReviews: VideoReview[] = [
  {
    name: 'Subhuti',
    video: '/images/subhuti.mp4',
    poster: '/images/subhuti-thumb.webp',
    result: '84 → 75 kg',
    story:
      'Six weeks left of maternity leave, 84 kg, running on empty, inflammation and hair fall on top of it. Over her programme she came down to 75 kg, cleared the inflammation and got her energy back. The thing she talks about is not the number. It is that she went back to work without dragging herself through every day.',
    short:
      'Six weeks left of maternity leave and running on empty. She went back to work without dragging herself through every day.',
    stats: [
      { value: '84 → 75 kg', label: 'Weight' },
      { value: 'Reversed', label: 'Inflammation' },
      { value: 'Resolved', label: 'Hair fall' },
    ],
  },
]

/** Every review in one list, for compact placements that don't care about medium. */
export const allReviews: Review[] = [...imageReviews, ...videoReviews]
