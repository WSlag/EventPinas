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

export default function TermsPage() {
  return (
    <PageShell className="space-y-space-10">
      <HeroBanner
        eyebrow="Legal"
        title="Terms of Service"
        description="Effective date: April 11, 2025. Please read these terms carefully before using EventPinas."
        tone="dark"
      />

      {/* 1 */}
      <section className="space-y-space-3">
        <SectionHeader title="1. Acceptance of Terms" />
        <ProseCard>
          <p>
            By accessing or using the EventPinas platform (the &quot;Platform&quot;), you agree to be bound by these Terms of
            Service (&quot;Terms&quot;). If you do not agree, you may not use the Platform. EventPinas, Inc. (&quot;EventPinas,&quot;
            &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) reserves the right to update these Terms at any time with notice provided through
            the Platform.
          </p>
        </ProseCard>
      </section>

      {/* 2 */}
      <section className="space-y-space-3">
        <SectionHeader title="2. Account Registration & Eligibility" />
        <ProseCard>
          <p>
            You must be at least 18 years old to create an account. By registering, you represent that the information
            you provide is accurate and complete. You are responsible for maintaining the confidentiality of your
            account credentials and for all activity that occurs under your account.
          </p>
          <p>
            EventPinas reserves the right to suspend or terminate accounts that violate these Terms, provide false
            information, or engage in fraudulent activity.
          </p>
        </ProseCard>
      </section>

      {/* 3 */}
      <section className="space-y-space-3">
        <SectionHeader title="3. Platform Use" />
        <ProseCard>
          <p>You may use the Platform only for lawful purposes. You agree not to:</p>
          <ul className="ml-space-4 list-disc space-y-space-1">
            <li>Post false, misleading, or fraudulent event or supplier information.</li>
            <li>Harass, threaten, or harm other users.</li>
            <li>Scrape, crawl, or data-mine the Platform without written permission.</li>
            <li>Use the Platform to distribute spam, malware, or unsolicited communications.</li>
            <li>Attempt to gain unauthorized access to any part of the Platform or its infrastructure.</li>
            <li>Violate any applicable Philippine law or regulation.</li>
          </ul>
        </ProseCard>
      </section>

      {/* 4 */}
      <section className="space-y-space-3">
        <SectionHeader title="4. Organizer Obligations" />
        <ProseCard>
          <p>
            Organizers are solely responsible for the accuracy of their event listings, including date, time, venue,
            ticket pricing, and event details. EventPinas is a marketplace and is not a party to the contract between
            organizers and attendees.
          </p>
          <p>
            In the event of a cancellation, postponement, or material change, organizers must update their listing
            promptly and communicate directly with registered attendees. Refund obligations are governed by the
            organizer&apos;s stated refund policy.
          </p>
        </ProseCard>
      </section>

      {/* 5 */}
      <section className="space-y-space-3">
        <SectionHeader title="5. Supplier Listings" />
        <ProseCard>
          <p>
            Suppliers are responsible for the accuracy of their profiles, including services offered, pricing ranges,
            and contact information. Listings must not contain prohibited content (see our{' '}
            <Link to="/acceptable-use" className="text-primary-500 hover:text-primary-600">Acceptable Use Policy</Link>).
          </p>
          <p>
            EventPinas does not guarantee the quality or performance of any supplier listed on the Platform and is
            not liable for disputes between suppliers and clients.
          </p>
        </ProseCard>
      </section>

      {/* 6 */}
      <section className="space-y-space-3">
        <SectionHeader title="6. Intellectual Property" />
        <ProseCard>
          <p>
            All content on the Platform — including design, code, trademarks, and copy — is owned by or licensed to
            EventPinas and may not be reproduced, distributed, or modified without written permission.
          </p>
          <p>
            By posting content (event photos, supplier portfolios, reviews, etc.) on the Platform, you grant
            EventPinas a non-exclusive, royalty-free, worldwide licence to display, reproduce, and promote that
            content in connection with the Platform.
          </p>
        </ProseCard>
      </section>

      {/* 7 */}
      <section className="space-y-space-3">
        <SectionHeader title="7. Limitation of Liability" />
        <ProseCard>
          <p>
            To the maximum extent permitted by law, EventPinas is not liable for any indirect, incidental, special,
            or consequential damages arising from your use of the Platform, including but not limited to loss of
            profits, data, or business opportunities.
          </p>
          <p>
            EventPinas&apos;s total liability to you for any claim arising from these Terms shall not exceed the amount
            you paid to EventPinas in the twelve (12) months preceding the claim, or PHP 1,000, whichever is greater.
          </p>
        </ProseCard>
      </section>

      {/* 8 */}
      <section className="space-y-space-3">
        <SectionHeader title="8. Governing Law" />
        <ProseCard>
          <p>
            These Terms are governed by the laws of the Republic of the Philippines. Any disputes arising under these
            Terms shall be subject to the exclusive jurisdiction of the Regional Trial Courts of Makati City,
            Metro Manila, Philippines.
          </p>
        </ProseCard>
      </section>

      {/* 9 */}
      <section className="space-y-space-3">
        <SectionHeader title="9. Changes to These Terms" />
        <ProseCard>
          <p>
            We may update these Terms from time to time. When we do, we will revise the effective date at the top of
            this page and, where appropriate, notify you by email or in-app notification. Continued use of the
            Platform after changes take effect constitutes acceptance of the updated Terms.
          </p>
        </ProseCard>
      </section>

      {/* 10 */}
      <section className="space-y-space-3">
        <SectionHeader title="10. Contact" />
        <ProseCard>
          <p>
            If you have questions about these Terms, please contact us at{' '}
            <a href="mailto:legal@eventpinas.com" className="text-primary-500 hover:text-primary-600">
              legal@eventpinas.com
            </a>{' '}
            or visit our{' '}
            <Link to="/contact" className="text-primary-500 hover:text-primary-600">Contact page</Link>.
          </p>
        </ProseCard>
      </section>
    </PageShell>
  )
}
