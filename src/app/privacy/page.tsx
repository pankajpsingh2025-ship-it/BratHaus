import type { Metadata } from "next";
import { site } from "@/content/site";
import LegalPage from "@/components/sections/LegalPage";

export const metadata: Metadata = { title: "Privacy notice", description: "How BratHaus collects, uses and protects personal data.", alternates: { canonical: "/privacy" } };

// TEMPLATE: to be reviewed (ideally by a qualified adviser) before launch.
export default function Privacy() {
  return (
    <LegalPage title="Privacy notice.">

      <p>This notice explains how {site.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) collects and uses personal data when you visit this website or contact us. We are the controller of that data under the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.</p>

      <h2>What we collect</h2>
      <ul>
        <li><b>Enquiries:</b> the details you give in the contact form: your name, email, and optionally your phone number, business name, website, what you need, timeline, budget range and message.</li>
        <li><b>Emails and calls:</b> anything you send us directly, and notes from calls you book with us.</li>
        <li><b>Technical data:</b> our hosting provider may process your IP address and basic request information to deliver the site and protect it from abuse. We use it briefly to limit repeated form submissions.</li>
      </ul>

      <h2>How we use it, and why we&apos;re allowed to</h2>
      <ul>
        <li>To reply to your enquiry and discuss a possible project. Our lawful basis is your consent, given when you submit the form, and our legitimate interest in responding to people who contact us.</li>
        <li>To prepare quotes and, if we work together, to deliver the project. The lawful basis is taking steps to enter into, and perform, a contract.</li>
        <li>To keep records we&apos;re required to keep for tax and accounting. The lawful basis is legal obligation.</li>
      </ul>
      <p>We don&apos;t sell your data, and we don&apos;t use it for automated decision-making.</p>

      <h2>Who processes it for us</h2>
      <ul>
        <li><b>Resend</b> delivers the contact form to our inbox. It processes the details you submit on our behalf, as our processor.</li>
        <li>Our website host, and our email provider, which store and transmit messages.</li>
      </ul>
      <p>Some of these providers may process data outside the UK. Where they do, we rely on appropriate safeguards such as the UK International Data Transfer Agreement or adequacy regulations.</p>

      <h2>Cookies</h2>
      <p>This site does not use analytics or advertising cookies. If that changes, we&apos;ll ask for your consent first with a cookie banner and update this notice.</p>

      <h2>How long we keep it</h2>
      <p>Enquiries that don&apos;t become projects are deleted within 12 months. Client records are kept for as long as we work together and then for up to six years for legal and accounting purposes.</p>

      <h2>Your rights</h2>
      <p>You can ask to access, correct or delete your data, to restrict or object to how we use it, or to receive a copy in a portable format. Where we rely on consent you can withdraw it at any time. Email <a href={`mailto:${site.email}`}>{site.email}</a> and we&apos;ll respond within one month.</p>
      <p>If you&apos;re unhappy with how we&apos;ve handled your data, you can complain to the Information Commissioner&apos;s Office at <a href="https://ico.org.uk" target="_blank" rel="noopener">ico.org.uk</a>.</p>

      <h2>Contact</h2>
      <p>{site.name}, {site.location}. Email: <a href={`mailto:${site.email}`}>{site.email}</a>.</p>
    </LegalPage>
  );
}
