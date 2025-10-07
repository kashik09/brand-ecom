export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <header className="mb-8">
        <p className="text-xs tracking-widest opacity-60 uppercase">Terms</p>
        <h1 className="text-3xl font-semibold mt-2">Terms of Service</h1>
        <p className="text-sm opacity-70 mt-1">Please read before using the store.</p>
      </header>

      <section className="space-y-6 leading-relaxed text-[15px]">
        <h2 className="text-xl font-semibold">Accounts</h2>
        <p>You’re responsible for accurate account details and keeping credentials confidential.</p>

        <h2 className="text-xl font-semibold">Orders & Digital Downloads</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>All prices are in UGX.</li>
          <li>Digital items are delivered via secure download links with expiry and/or limited uses.</li>
          <li>Keep your links private; sharing may disable access.</li>
        </ul>

        <h2 className="text-xl font-semibold">Refunds</h2>
        <p>
          Digital products are generally non-refundable once delivered, except where required by law.
          If there’s an issue, contact us; we’ll help.
        </p>

        <h2 className="text-xl font-semibold">Acceptable Use</h2>
        <p>No unlawful or harmful activities. Don’t bypass security or redistribute paid files.</p>

        <h2 className="text-xl font-semibold">Changes</h2>
        <p>We may update these terms. Continued use means you accept any changes.</p>

        <h2 className="text-xl font-semibold">Contact</h2>
        <p>Use the Contact link to message us on WhatsApp.</p>

        <p className="text-xs opacity-70">This page is informational and not legal advice.</p>
      </section>
    </main>
  );
}
