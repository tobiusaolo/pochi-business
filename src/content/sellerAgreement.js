export const SELLER_AGREEMENT_META = {
  title: 'Seller Agreement',
  lastUpdated: 'May 11, 2026',
  effectiveDate: 'Upon Seller onboarding and platform approval',
  parties: [
    'Tourify Technologies Ltd ("Tourify"), a company incorporated under the laws of Uganda and operator of the Pochi platform, and',
    'The Seller, as identified during platform registration and onboarding.',
  ],
};

export const SELLER_AGREEMENT_SECTIONS = [
  {
    id: 'purpose',
    title: '1. Purpose',
    paragraphs: [
      'Tourify operates the Pochi digital commerce marketplace, connecting Customers with independent Sellers across East Africa.',
      'This Agreement governs Seller access to, participation in, and obligations on the platform.',
    ],
  },
  {
    id: 'independent-relationship',
    title: '2. Independent Seller Relationship',
    bullets: [
      'Seller acts as an independent contractor',
      'No employment, agency, partnership, joint venture, or franchise relationship is created',
      'Seller retains sole responsibility for its operations, inventory, product quality, taxes, staffing, and regulatory compliance',
      'Tourify functions solely as a technology intermediary unless otherwise expressly stated',
    ],
  },
  {
    id: 'eligibility',
    title: '3. Seller Eligibility and Compliance',
    intro: 'Seller must:',
    bullets: [
      'Be legally registered where required',
      'Maintain all necessary business licenses, permits, and approvals',
      'Comply with laws of Uganda, Kenya, Tanzania, Rwanda, and other relevant jurisdictions',
      'Maintain tax compliance',
      'Comply with consumer protection, competition, AML/KYC, and data privacy regulations',
      'Maintain appropriate insurance where applicable',
    ],
  },
  {
    id: 'obligations',
    title: '4. Seller Obligations',
    intro: 'Seller shall:',
    bullets: [
      'Provide accurate, lawful, and non-misleading listings',
      'Maintain inventory accuracy',
      'Fulfil orders promptly and professionally',
      'Honour displayed cancellation, refund, and return policies',
      'Maintain acceptable cancellation and dispute thresholds',
      'Respond to customer complaints and disputes within 72 hours',
      'Ensure products meet safety and regulatory standards',
      'Avoid prohibited, counterfeit, or illegal goods',
    ],
  },
  {
    id: 'ip',
    title: '5. Listings, Branding, and Intellectual Property',
    bullets: [
      'Seller grants Tourify a non-exclusive, royalty-free license to display business names, trademarks, logos, product descriptions, and related content for platform operations and marketing',
      'Seller warrants ownership or lawful authorisation for all submitted content',
      'Seller bears full liability for IP infringement claims arising from Seller content or products',
    ],
  },
  {
    id: 'pricing',
    title: '6. Pricing and Commission',
    bullets: [
      'Seller independently sets product pricing, subject to platform standards',
      'Tourify deducts agreed platform commission per completed transaction',
      'Commission rates may vary by category or region and may be updated with notice',
      'Tourify may deduct fees, refunds, penalties, taxes, or chargebacks from payouts',
    ],
  },
  {
    id: 'payments',
    title: '7. Payments and Settlement',
    subsections: [
      {
        heading: 'Where Tourify Processes Payments:',
        bullets: [
          'Customer funds may be held until delivery confirmation, fraud review, or dispute resolution',
          'Payouts occur according to platform settlement schedules, less applicable deductions',
        ],
      },
      {
        heading: 'Where Seller Processes Payments Directly:',
        bullets: [
          'Seller bears sole responsibility for payment compliance, refunds, disputes, and tax obligations',
          'Seller indemnifies Tourify for losses arising from Seller-controlled payment failures',
        ],
      },
    ],
  },
  {
    id: 'refunds',
    title: '8. Refunds, Returns, and Cancellations',
    intro: 'Seller must:',
    bullets: [
      'Select and comply with approved refund policy categories',
      'Maintain machine-readable policy metadata where required',
      'Honour all approved refund obligations',
      'Cover all refunds caused by Seller fault, including:',
    ],
    nestedBullets: [
      'Misrepresentation',
      'Defective goods',
      'Delivery failures',
      'Fraudulent conduct',
    ],
    footerIntro: 'Repeated excessive cancellations, refund abuse, or policy breaches may result in:',
    footerBullets: [
      'Financial penalties',
      'Commission forfeiture',
      'Reduced platform visibility',
      'Suspension or termination',
    ],
  },
  {
    id: 'cancellations',
    title: '9. Seller-Initiated Order Cancellations',
    intro: 'Where Seller cancels confirmed orders:',
    bullets: [
      'Immediate notification to Tourify is required',
      'Customer must receive legally required refunds',
      'Seller assumes all resulting financial liability',
      'Tourify may impose administrative sanctions',
    ],
  },
  {
    id: 'data-protection',
    title: '10. Data Protection and Customer Information',
    intro: 'Seller shall:',
    bullets: [
      'Process Customer data solely for lawful fulfilment purposes',
      'Comply with:',
    ],
    nestedBullets: [
      'Uganda Data Protection and Privacy Act',
      'Kenya Data Protection Act',
      'Tanzania Personal Data Protection laws',
      'Rwanda data privacy laws',
    ],
    footerBullets: [
      'Implement adequate technical and organizational safeguards',
      'Refrain from unauthorised marketing or resale of Customer data',
    ],
  },
  {
    id: 'insurance',
    title: '11. Insurance Requirements',
    intro: 'Where applicable, Seller must maintain adequate:',
    bullets: [
      'Public liability insurance',
      'Product liability insurance',
      'Commercial vehicle insurance',
      'Professional indemnity insurance',
    ],
    paragraphs: [
      'Minimum coverage levels may be specified by Tourify based on risk category.',
    ],
  },
  {
    id: 'indemnification',
    title: '12. Indemnification',
    intro: 'Seller agrees to defend, indemnify, and hold Tourify harmless against claims, losses, liabilities, penalties, or regulatory actions arising from:',
    bullets: [
      'Product defects',
      'Delivery failures',
      'Personal injury or property damage',
      'Consumer law breaches',
      'Tax violations',
      'Fraud',
      'IP infringement',
      'Data protection violations',
    ],
  },
  {
    id: 'liability',
    title: '13. Limitation of Liability',
    intro: 'To the fullest extent permitted by law:',
    bullets: [
      "Tourify's aggregate liability is limited to platform commissions earned from Seller during the preceding 6 months",
      'Tourify is not liable for indirect, consequential, reputational, or lost-profit damages',
      'Tourify is not liable for Seller operational failures or third-party disruptions',
    ],
  },
  {
    id: 'termination',
    title: '14. Suspension and Termination',
    intro: 'Tourify may suspend or terminate Seller accounts immediately for:',
    bullets: [
      'Fraud',
      'Illegal activity',
      'Counterfeit goods',
      'Repeated policy breaches',
      'Excessive disputes or cancellations',
      'Regulatory non-compliance',
      'Reputational harm to platform integrity',
    ],
    paragraphs: ['Either party may otherwise terminate with 30 days\' written notice.'],
  },
  {
    id: 'force-majeure',
    title: '15. Force Majeure',
    intro: 'Neither party shall be liable for failures caused by events beyond reasonable control, including:',
    bullets: [
      'Natural disasters',
      'Political instability',
      'Government restrictions',
      'Supply chain disruptions',
      'Telecommunications failures',
      'Cybersecurity incidents',
    ],
  },
  {
    id: 'governing-law',
    title: '16. Governing Law and Dispute Resolution',
    paragraphs: [
      'This Agreement shall be governed by applicable laws of Uganda, Kenya, Tanzania, Rwanda, or relevant transaction jurisdiction.',
      'Disputes shall first undergo platform mediation before arbitration or court proceedings as legally required.',
    ],
  },
  {
    id: 'amendments',
    title: '17. Amendments',
    paragraphs: [
      'Tourify may update this Agreement periodically with notice.',
      'Continued platform participation constitutes acceptance of revised terms.',
    ],
  },
  {
    id: 'contact',
    title: '18. Contact Information',
    contact: {
      company: 'Tourify Technologies Ltd',
      lines: [
        { label: 'Legal', value: 'legal@tourug.com' },
        { label: 'Compliance', value: 'compliance@tourug.com' },
      ],
    },
  },
];
