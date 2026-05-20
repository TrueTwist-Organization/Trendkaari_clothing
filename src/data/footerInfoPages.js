import { SUPPORT_EMAIL, SUPPORT_PHONE_DISPLAY, SUPPORT_HOURS } from '../constants/contact';

/** @typedef {{ heading: string, paragraphs?: string[], list?: string[] }} InfoSection */

/**
 * Full content for footer policy & help pages.
 * Slug matches URL: /info/{slug}
 */
export const FOOTER_INFO_PAGES = {
  about: {
    title: 'About trendkaari',
    subtitle: 'Curated ethnic & contemporary fashion for every Indian occasion',
    lastUpdated: 'May 2026',
    sections: [
      {
        heading: 'Who we are',
        paragraphs: [
          'trendkaari is an India-focused fashion brand offering kurtas, suit sets, sarees, lehengas, co-ords, and everyday ethnic wear for women and men. We combine thoughtful design, quality fabrics, and transparent pricing so you can shop confidently for festivals, weddings, office wear, and daily life.',
          'Our catalog is photographed in natural light with size charts on every product page. We work with verified manufacturing partners and conduct quality checks before dispatch.',
        ],
      },
      {
        heading: 'What we stand for',
        list: [
          'Honest product descriptions and fabric composition on every listing',
          'Nationwide delivery with SMS and email tracking updates',
          'Responsive customer care — phone, email, and WhatsApp',
          'Easy returns on eligible items within 7 days of delivery',
        ],
      },
      {
        heading: 'Registered business',
        paragraphs: [
          'trendkaari operates as an online retailer serving customers across India. For partnership, bulk orders, or media enquiries, write to care@trendkaari with your company details and we will respond within 2 business days.',
        ],
      },
    ],
  },
  returns: {
    title: 'Raise a Return',
    subtitle: 'Step-by-step guide to return an item',
    lastUpdated: 'May 2026',
    sections: [
      {
        heading: 'Before you start',
        paragraphs: [
          'Returns are accepted within 7 calendar days from the date of delivery. Items must be unused, unwashed, and have all original tags, labels, and packaging intact.',
        ],
        list: [
          'Sign in to your trendkaari account (guest checkout orders: contact care with order ID)',
          'Open My Account → My Orders',
          'Select the order and tap Raise Return on the eligible item',
          'Choose a reason and upload photos if the item is defective or wrong',
        ],
      },
      {
        heading: 'Pickup & drop-off',
        paragraphs: [
          'Once approved, you will receive return instructions by SMS/email within 24–48 hours. We arrange reverse pickup in most serviceable PIN codes. If pickup is unavailable, we share a courier address for self-ship (shipping reimbursed on approved quality issues).',
        ],
      },
      {
        heading: 'Non-returnable items',
        list: [
          'Innerwear, socks, and personal-care accessories',
          'Customized, altered, or made-to-order pieces',
          'Items marked Final Sale or purchased with non-returnable coupons',
          'Products without original tags or with signs of wear, perfume, or damage',
        ],
      },
      {
        heading: 'Need help?',
        paragraphs: [
          `Email ${SUPPORT_EMAIL} or call ${SUPPORT_PHONE_DISPLAY}, ${SUPPORT_HOURS}. Include your order ID and registered mobile number.`,
        ],
      },
    ],
  },
  locator: {
    title: 'Store Locator',
    subtitle: 'Shop online — experience trendkaari across India',
    lastUpdated: 'May 2026',
    sections: [
      {
        heading: 'Online-first brand',
        paragraphs: [
          'trendkaari is primarily an e-commerce store at trendkaari. Your entire wardrobe — from daily kurtas to wedding lehengas — can be browsed, sized, and ordered from any device with delivery to your doorstep.',
        ],
      },
      {
        heading: 'Pop-ups & events',
        paragraphs: [
          'We participate in select city pop-ups during festive seasons (Diwali, wedding season, etc.). Dates and venues are announced on our Instagram and newsletter. Subscribe in the footer to get early access invites.',
        ],
      },
      {
        heading: 'Styling & bulk orders',
        paragraphs: [
          `For corporate gifting, boutique partnerships, or bulk purchases (10+ pieces), contact ${SUPPORT_EMAIL}. Our team can share lookbooks, fabric swatches, and B2B pricing.`,
        ],
      },
      {
        heading: 'Customer care',
        list: [
          `Phone: ${SUPPORT_PHONE_DISPLAY}`,
          `Email: ${SUPPORT_EMAIL}`,
          `Hours: ${SUPPORT_HOURS}`,
          'WhatsApp: use the chat button on the website',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    subtitle: 'Please read before using trendkaari',
    lastUpdated: 'May 2026',
    sections: [
      {
        heading: '1. Agreement',
        paragraphs: [
          'By accessing trendkaari, creating an account, or placing an order, you agree to these Terms & Conditions and our Privacy practices. If you do not agree, please do not use the site.',
        ],
      },
      {
        heading: '2. Products & pricing',
        list: [
          'Prices are listed in Indian Rupees (INR) and include applicable taxes unless stated otherwise',
          'Product images are representative; minor colour variation may occur due to screens and fabric batches',
          'We reserve the right to correct pricing errors and cancel orders affected by such errors with a full refund',
          'Promotional codes are subject to validity dates, minimum order value, and one use per customer unless specified',
        ],
      },
      {
        heading: '3. Orders & payment',
        paragraphs: [
          'An order is confirmed only after successful payment authorization (UPI, cards, net banking, wallets, or COD where available). We may contact you to verify high-value or flagged orders before dispatch.',
        ],
      },
      {
        heading: '4. Account responsibility',
        paragraphs: [
          'You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account. Notify us immediately of unauthorized use.',
        ],
      },
      {
        heading: '5. Limitation of liability',
        paragraphs: [
          'trendkaari is not liable for indirect or consequential damages arising from use of the website. Our maximum liability for any order is limited to the amount paid for that order, subject to applicable consumer protection law in India.',
        ],
      },
      {
        heading: '6. Governing law',
        paragraphs: [
          'These terms are governed by the laws of India. Disputes shall be subject to the exclusive jurisdiction of courts in India unless otherwise required by mandatory consumer law.',
        ],
      },
    ],
  },
  shipping: {
    title: 'Shipping Policy',
    subtitle: 'Delivery timelines, charges & tracking',
    lastUpdated: 'May 2026',
    sections: [
      {
        heading: 'Processing time',
        paragraphs: [
          'Orders are processed within 2–4 business days (Monday–Saturday, excluding public holidays) after payment confirmation. During peak sale periods, processing may extend by 1–2 days — we display notices on the website when applicable.',
        ],
      },
      {
        heading: 'Delivery timeline',
        list: [
          'Metro cities: typically 3–5 business days after dispatch',
          'Other serviceable PIN codes: 5–7 business days after dispatch',
          'Remote or non-serviceable areas: we contact you with alternatives or cancellation/refund',
        ],
      },
      {
        heading: 'Shipping charges',
        paragraphs: [
          'Standard shipping fees (if any) are shown at checkout before you pay. Free shipping may apply on orders above a promotional threshold — the exact offer is displayed on the cart page.',
        ],
      },
      {
        heading: 'Tracking',
        paragraphs: [
          'Once dispatched, you receive an SMS and email with courier name and tracking ID. You can also view status under My Account → My Orders.',
        ],
      },
      {
        heading: 'Failed delivery attempts',
        paragraphs: [
          'If delivery fails due to incorrect address, refusal, or unavailability, the parcel may return to us. Re-shipping charges may apply for address errors attributable to the customer.',
        ],
      },
    ],
  },
  'return-policy': {
    title: 'Return Policy',
    subtitle: 'Eligibility, process & timelines',
    lastUpdated: 'May 2026',
    sections: [
      {
        heading: 'Return window',
        paragraphs: [
          'You may request a return within 7 calendar days from the delivery date marked by the courier. Requests after this window cannot be accepted unless covered by a manufacturing defect warranty.',
        ],
      },
      {
        heading: 'Eligible condition',
        list: [
          'Product unused, unwashed, and unworn',
          'All original tags, labels, and freebies (dupatta, belt, etc.) included',
          'Packaging intact — no tears, stains, or odour',
          'Return initiated from the same account used to place the order',
        ],
      },
      {
        heading: 'Exchange',
        paragraphs: [
          'Size exchanges are subject to stock availability. Place a return and reorder the correct size, or contact care for exchange assistance on the same SKU.',
        ],
      },
      {
        heading: 'Inspection & approval',
        paragraphs: [
          'Returned items pass a quality check within 48–72 hours of receipt at our warehouse. If the item fails inspection, we ship it back to you or offer partial refund as per case review.',
        ],
      },
      {
        heading: 'Refund timeline',
        paragraphs: [
          'Approved refunds are initiated within 5–7 business days after inspection. Bank and payment gateways may take an additional 3–10 business days to reflect the amount. See Refund Policy for payment-method details.',
        ],
      },
    ],
  },
  refund: {
    title: 'Refund Policy',
    subtitle: 'How and when you receive your money back',
    lastUpdated: 'May 2026',
    sections: [
      {
        heading: 'Refund methods',
        list: [
          'UPI / cards / net banking / wallets: refunded to the original payment source',
          'Cash on Delivery (COD): refunded via bank transfer (NEFT/IMPS) to the account you provide — verification may take 24 hours',
          'Store credit: optional faster credit for future purchases — contact care to opt in',
        ],
      },
      {
        heading: 'Timeline',
        paragraphs: [
          'After your return is approved at our warehouse, we initiate the refund within 5–7 business days. Your bank or card issuer controls final credit timing; most customers see amounts within 7–14 days total.',
        ],
      },
      {
        heading: 'Partial refunds',
        paragraphs: [
          'Partial refunds may apply when: tags are missing, item shows wear, only part of a set is returned, or promotional free gifts are not returned. The deduction is communicated before processing.',
        ],
      },
      {
        heading: 'Cancelled orders',
        paragraphs: [
          'If we cancel your order (out of stock, verification failure, or pricing error), a full refund is processed automatically. COD orders that were not charged require no refund action.',
        ],
      },
      {
        heading: 'Questions',
        paragraphs: [
          `For refund status, email ${SUPPORT_EMAIL} with order ID and last 4 digits of payment reference. Phone: ${SUPPORT_PHONE_DISPLAY}, ${SUPPORT_HOURS}.`,
        ],
      },
    ],
  },
  esg: {
    title: 'ESG Policy',
    subtitle: 'Environmental, social & governance commitments',
    lastUpdated: 'May 2026',
    sections: [
      {
        heading: 'Environmental',
        list: [
          'Recyclable mailer bags and reduced plastic in packaging where suppliers allow',
          'Batch planning to lower fabric waste; remnant fabric donated or repurposed',
          'Roadmap to publish fabric mill partners and dyeing compliance certificates',
        ],
      },
      {
        heading: 'Social',
        list: [
          'Manufacturing partners audited for minimum wage compliance and workplace safety',
          'No child labour tolerance — contractual obligations with suppliers',
          'Employee training on fair customer communication and inclusive sizing guidance',
        ],
      },
      {
        heading: 'Governance',
        list: [
          'Clear return, refund, and privacy policies published on the website',
          'Grievance channel via care@trendkaari with 48-hour first response target',
          'Annual review of ESG goals by leadership — summary shared in CSR report',
        ],
      },
    ],
  },
  annual: {
    title: 'Annual Return',
    subtitle: 'Corporate disclosures & compliance',
    lastUpdated: 'May 2026',
    sections: [
      {
        heading: 'Overview',
        paragraphs: [
          'trendkaari files statutory returns and financial statements as required under applicable Indian corporate and tax laws. This page is for transparency with partners, vendors, and investors seeking compliance information.',
        ],
      },
      {
        heading: 'Available documents',
        paragraphs: [
          'Certified copies of annual returns and financial statements are available on request to verified stakeholders. Send your organisation name, purpose, and contact details to care@trendkaari with subject line "Annual Return Request".',
        ],
      },
      {
        heading: 'Timeline',
        paragraphs: [
          'We typically publish the prior financial year summary within 6 months of year-end, subject to audit completion.',
        ],
      },
    ],
  },
  csr: {
    title: 'CSR Policy',
    subtitle: 'Community & sustainability initiatives',
    lastUpdated: 'May 2026',
    sections: [
      {
        heading: 'Our focus areas',
        list: [
          'Artisan livelihoods: workshops with weavers and karigars in tier-2 cities',
          'Women’s skill development: stitching and quality-check training programs',
          'Responsible inventory: donation of unsold eligible apparel to NGO partners',
        ],
      },
      {
        heading: 'Festive programs',
        paragraphs: [
          'Each year we allocate a portion of festive-season revenue to community partners. Recent initiatives include school uniform fabric drives and flood-relief clothing bundles coordinated with local NGOs.',
        ],
      },
      {
        heading: 'Partner with us',
        paragraphs: [
          'Registered NGOs and community organisations may write to care@trendkaari with registration documents and proposal summary. We review requests quarterly.',
        ],
      },
    ],
  },
  faq: {
    title: "Frequently Asked Questions",
    subtitle: 'Quick answers about orders, sizing & payments',
    lastUpdated: 'May 2026',
    sections: [
      {
        heading: 'Orders & tracking',
        list: [
          'How do I track my order? — Sign in → My Account → My Orders. Tracking link appears after dispatch.',
          'Can I cancel before shipping? — Yes, within 2 hours of placing the order or before dispatch — contact care immediately.',
          'I entered the wrong address — Email care@trendkaari with order ID before the parcel ships.',
        ],
      },
      {
        heading: 'Sizing & fit',
        list: [
          'Which size should I choose? — Use the size chart on each product page; measure bust, waist, and hip in inches.',
          'Fit feels tight — Ethnic wear may vary by cut; exchange via Return Policy within 7 days if unworn with tags.',
        ],
      },
      {
        heading: 'Payments',
        list: [
          'Payment failed but amount deducted — It usually reverses within 5–7 days; if not, email us with transaction reference.',
          'Do you offer COD? — Available on select PIN codes; shown at checkout when eligible.',
          'Can I use multiple coupons? — Only one coupon per order unless a promotion states otherwise.',
        ],
      },
      {
        heading: 'Contact',
        paragraphs: [
          `Phone: ${SUPPORT_PHONE_DISPLAY} | Email: ${SUPPORT_EMAIL} | Hours: ${SUPPORT_HOURS}`,
        ],
      },
    ],
  },
};

export const FOOTER_INFO_SLUGS = Object.keys(FOOTER_INFO_PAGES);

export function getInfoPage(slug) {
  return FOOTER_INFO_PAGES[slug] ?? null;
}
