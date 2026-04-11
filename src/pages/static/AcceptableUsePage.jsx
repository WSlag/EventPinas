import { Link } from 'react-router-dom'
import { HeroBanner, PageShell, SectionHeader, SurfaceCard } from '@/components/ui/MarketplacePrimitives'

function ProseCard({ children }) {
  return (
    <SurfaceCard>
      <div className="space-y-space-2 font-body text-body-sm leading-relaxed text-neutral-700">
        {children}
      </div>
    </SurfaceCard>
  )
}

export default function AcceptableUsePage() {
  return (
    <PageShell className="space-y-space-10">
      <HeroBanner
        eyebrow="Legal"
        title="Acceptable Use Policy"
        description="Effective date: April 11, 2025. This policy defines the standards for how EventPinas may and may not be used."
        tone="sunset"
      />

      {/* 1 */}
      <section className="space-y-space-3">
        <SectionHeader title="1. Purpose" />
        <ProseCard>
          <p>
            EventPinas exists to connect people through events. This Acceptable Use Policy ("AUP") protects our
            community — event-goers, organizers, and suppliers — by setting clear boundaries on how the Platform
            may be used. Using EventPinas means you agree to these standards.
          </p>
        </ProseCard>
      </section>

      {/* 2 */}
      <section className="space-y-space-3">
        <SectionHeader title="2. Prohibited Activities" />
        <ProseCard>
          <p>The following are strictly prohibited on EventPinas:</p>
          <ul className="ml-space-4 list-disc space-y-space-1">
            <li><span className="font-semibold text-neutral-900">Fraudulent events</span> — creating fake, misleading, or non-existent event listings to collect registrations or payments.</li>
            <li><span className="font-semibold text-neutral-900">Impersonation</span> — pretending to be another person, organizer, supplier, or EventPinas itself.</li>
            <li><span className="font-semibold text-neutral-900">Spam</span> — sending unsolicited bulk messages to other users through any Platform feature.</li>
            <li><span className="font-semibold text-neutral-900">Harassment & abuse</span> — threatening, intimidating, or harassing any other user.</li>
            <li><span className="font-semibold text-neutral-900">Illegal content</span> — posting anything that violates Philippine law, including content promoting illegal gambling, drugs, weapons, or human trafficking.</li>
            <li><span className="font-semibold text-neutral-900">Hate speech & discrimination</span> — content that demeans individuals or groups based on race, religion, gender, sexual orientation, disability, or national origin.</li>
            <li><span className="font-semibold text-neutral-900">Unauthorized data collection</span> — scraping, crawling, or harvesting user data without explicit written permission from EventPinas.</li>
            <li><span className="font-semibold text-neutral-900">Platform abuse</span> — attempting to reverse-engineer, hack, overload, or disrupt the Platform or its infrastructure.</li>
            <li><span className="font-semibold text-neutral-900">False reviews</span> — submitting fake or incentivized reviews for events or suppliers.</li>
            <li><span className="font-semibold text-neutral-900">Reselling</span> — reselling event registrations or supplier slots at inflated prices without organizer authorization.</li>
          </ul>
        </ProseCard>
      </section>

      {/* 3 */}
      <section className="space-y-space-3">
        <SectionHeader title="3. Content Standards" />
        <ProseCard>
          <p>All content you post on EventPinas — event listings, supplier profiles, photos, and descriptions — must:</p>
          <ul className="ml-space-4 list-disc space-y-space-1">
            <li>Be accurate and not misleading.</li>
            <li>Not contain explicit, violent, or adult material unless the event is appropriately age-gated and disclosed.</li>
            <li>Not infringe the intellectual property rights of any third party.</li>
            <li>Be in Filipino or English (or clearly labeled if in another language).</li>
            <li>Not include personal contact details (phone numbers, emails) in publicly visible event or supplier descriptions — use designated contact fields instead.</li>
          </ul>
        </ProseCard>
      </section>

      {/* 4 */}
      <section className="space-y-space-3">
        <SectionHeader title="4. Enforcement" />
        <ProseCard>
          <p>EventPinas reserves the right to take any of the following actions in response to AUP violations:</p>
          <ul className="ml-space-4 list-disc space-y-space-1">
            <li><span className="font-semibold text-neutral-900">Warning</span> — a formal notice for minor or first-time violations.</li>
            <li><span className="font-semibold text-neutral-900">Content removal</span> — immediate removal of offending listings, profiles, or messages.</li>
            <li><span className="font-semibold text-neutral-900">Temporary suspension</span> — account access restricted for a defined period.</li>
            <li><span className="font-semibold text-neutral-900">Permanent ban</span> — account terminated for severe or repeated violations.</li>
            <li><span className="font-semibold text-neutral-900">Legal referral</span> — reporting to the appropriate Philippine government authorities where criminal activity is suspected.</li>
          </ul>
          <p>
            Enforcement decisions are at EventPinas's sole discretion. We will make reasonable efforts to notify
            affected users unless doing so would compromise an investigation.
          </p>
        </ProseCard>
      </section>

      {/* 5 */}
      <section className="space-y-space-3">
        <SectionHeader title="5. Reporting Violations" />
        <ProseCard>
          <p>
            If you encounter content or behavior that violates this policy, please report it to us at{' '}
            <a href="mailto:trust@eventpinas.com" className="text-primary-500 hover:text-primary-600">
              trust@eventpinas.com
            </a>. Include the relevant event or profile URL and a description of the issue. We take all reports
            seriously and aim to review them within 2 business days.
          </p>
        </ProseCard>
      </section>

      {/* 6 */}
      <section className="space-y-space-3">
        <SectionHeader title="6. Governing Law" />
        <ProseCard>
          <p>
            This AUP is governed by the laws of the Republic of the Philippines and is incorporated into our{' '}
            <Link to="/terms" className="text-primary-500 hover:text-primary-600">Terms of Service</Link>.
            Violations may also be subject to civil or criminal liability under applicable Philippine law.
          </p>
        </ProseCard>
      </section>
    </PageShell>
  )
}
