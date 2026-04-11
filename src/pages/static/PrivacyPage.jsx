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

export default function PrivacyPage() {
  return (
    <PageShell className="space-y-space-10">
      <HeroBanner
        eyebrow="Legal"
        title="Privacy Policy"
        description="Effective date: April 11, 2025. EventPinas is committed to protecting your personal data in accordance with the Data Privacy Act of 2012 (Republic Act No. 10173)."
        tone="dark"
      />

      {/* 1 */}
      <section className="space-y-space-3">
        <SectionHeader title="1. Data We Collect" />
        <ProseCard>
          <p>When you use EventPinas, we may collect the following types of personal information:</p>
          <ul className="ml-space-4 list-disc space-y-space-1">
            <li><span className="font-semibold text-neutral-900">Account information</span> — name, email address, password (hashed), and role (Event-Goer, Organizer, Supplier).</li>
            <li><span className="font-semibold text-neutral-900">Profile information</span> — business name, city, contact number, and portfolio content for Organizer and Supplier accounts.</li>
            <li><span className="font-semibold text-neutral-900">Event & registration data</span> — events you register for, QR check-in records, seating and waitlist data.</li>
            <li><span className="font-semibold text-neutral-900">Usage data</span> — pages visited, search queries, saved items, and feature interactions.</li>
            <li><span className="font-semibold text-neutral-900">Device & technical data</span> — IP address, browser type, operating system, and cookies. See our <Link to="/cookies" className="text-primary-500 hover:text-primary-600">Cookie Policy</Link> for details.</li>
          </ul>
        </ProseCard>
      </section>

      {/* 2 */}
      <section className="space-y-space-3">
        <SectionHeader title="2. How We Use Your Data" />
        <ProseCard>
          <p>We process your personal data for the following purposes:</p>
          <ul className="ml-space-4 list-disc space-y-space-1">
            <li>To create and manage your account.</li>
            <li>To operate the marketplace — displaying events, connecting organizers with suppliers, and facilitating registrations.</li>
            <li>To send transactional communications — registration confirmations, QR codes, and event updates.</li>
            <li>To improve the Platform through analytics and usage insights.</li>
            <li>To comply with legal obligations under Philippine law.</li>
            <li>To prevent fraud, abuse, and violations of our Terms of Service.</li>
          </ul>
        </ProseCard>
      </section>

      {/* 3 */}
      <section className="space-y-space-3">
        <SectionHeader title="3. Data Sharing" />
        <ProseCard>
          <p>
            We do <span className="font-semibold text-neutral-900">not sell</span> your personal data. We may share
            it only in the following limited circumstances:
          </p>
          <ul className="ml-space-4 list-disc space-y-space-1">
            <li><span className="font-semibold text-neutral-900">Service providers</span> — third-party vendors who help us operate the Platform (e.g., cloud hosting, email delivery), bound by data processing agreements.</li>
            <li><span className="font-semibold text-neutral-900">Organizers</span> — when you register for an event, the organizer receives your registration details to manage attendance.</li>
            <li><span className="font-semibold text-neutral-900">Legal compliance</span> — when required by law, court order, or government authority in the Philippines.</li>
          </ul>
        </ProseCard>
      </section>

      {/* 4 */}
      <section className="space-y-space-3">
        <SectionHeader title="4. Data Retention" />
        <ProseCard>
          <p>
            We retain your personal data for as long as your account is active or as needed to provide our services.
            If you delete your account, we will remove your personal data within 30 days, except where retention is
            required by law (e.g., for audit or tax purposes).
          </p>
        </ProseCard>
      </section>

      {/* 5 — DPA anchor */}
      <section id="dpa" className="space-y-space-3 scroll-mt-20">
        <SectionHeader title="5. Your Rights Under RA 10173 (Data Privacy Act of 2012)" />
        <ProseCard>
          <p>
            As a data subject under the Philippine Data Privacy Act of 2012 (Republic Act No. 10173), you have the
            following rights:
          </p>
          <ul className="ml-space-4 list-disc space-y-space-1">
            <li><span className="font-semibold text-neutral-900">Right to be informed</span> — to know what personal data we collect and how we use it.</li>
            <li><span className="font-semibold text-neutral-900">Right of access</span> — to request a copy of your personal data we hold.</li>
            <li><span className="font-semibold text-neutral-900">Right to correction</span> — to have inaccurate or incomplete data corrected.</li>
            <li><span className="font-semibold text-neutral-900">Right to erasure</span> — to request deletion of your personal data under certain conditions.</li>
            <li><span className="font-semibold text-neutral-900">Right to data portability</span> — to receive your data in a structured, commonly used format.</li>
            <li><span className="font-semibold text-neutral-900">Right to object</span> — to object to the processing of your data for direct marketing or other purposes.</li>
          </ul>
          <p>
            To exercise any of these rights, email our Data Protection Officer at{' '}
            <a href="mailto:dpo@eventpinas.com" className="text-primary-500 hover:text-primary-600">
              dpo@eventpinas.com
            </a>.
            We will respond within 15 days in accordance with NPC guidelines.
          </p>
        </ProseCard>
      </section>

      {/* 6 */}
      <section className="space-y-space-3">
        <SectionHeader title="6. National Privacy Commission (NPC)" />
        <ProseCard>
          <p>
            If you believe your data privacy rights have been violated, you have the right to lodge a complaint with
            the National Privacy Commission (NPC) of the Philippines. You can reach the NPC at{' '}
            <span className="font-semibold text-neutral-900">www.privacy.gov.ph</span>.
          </p>
        </ProseCard>
      </section>

      {/* 7 */}
      <section className="space-y-space-3">
        <SectionHeader title="7. Cookies" />
        <ProseCard>
          <p>
            We use cookies to operate the Platform and improve your experience. For full details on the cookies we
            use and how to manage them, please see our{' '}
            <Link to="/cookies" className="text-primary-500 hover:text-primary-600">Cookie Policy</Link>.
          </p>
        </ProseCard>
      </section>

      {/* 8 */}
      <section className="space-y-space-3">
        <SectionHeader title="8. Contact Our Data Protection Officer" />
        <ProseCard>
          <p>
            For any privacy-related inquiries, requests, or concerns, please contact:
          </p>
          <p>
            <span className="font-semibold text-neutral-900">Data Protection Officer, EventPinas, Inc.</span>
            <br />
            <a href="mailto:dpo@eventpinas.com" className="text-primary-500 hover:text-primary-600">
              dpo@eventpinas.com
            </a>
            <br />
            Metro Manila, Philippines
          </p>
        </ProseCard>
      </section>
    </PageShell>
  )
}
