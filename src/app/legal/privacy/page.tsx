export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <header className="mb-8">
        <p className="text-xs tracking-widest opacity-60 uppercase">Privacy Policy</p>
        <h1 className="text-3xl font-semibold mt-2">Privacy Policy</h1>
        <p className="text-sm opacity-70 mt-1">Last updated {new Date().toLocaleDateString()}</p>
      </header>

      <section className="space-y-6 leading-relaxed text-[15px]">
        <p>
          This policy explains what we collect, how we use it, and the choices available to you.
          It applies to the store and related services we operate.
        </p>

        <h2 className="text-xl font-semibold">Data we collect</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Account details you provide (name, phone, optional email)</li>
          <li>Order, invoice, and download history</li>
          <li>Basic device and usage data for security and performance</li>
        </ul>

        <h2 className="text-xl font-semibold">How we use data</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Process orders and deliver digital files</li>
          <li>Provide support and resolve issues</li>
          <li>Prevent fraud and keep the platform secure</li>
          <li>Improve products and user experience</li>
        </ul>

        <h2 className="text-xl font-semibold">Sharing</h2>
        <p>
          We don’t sell personal data. We share minimal data with infrastructure providers
          (hosting, databases, payment, messaging) to operate the service, and when required by law.
        </p>

        <h2 className="text-xl font-semibold">Retention</h2>
        <p>
          We keep records only as long as needed for operations, legal, and security reasons,
          then delete or anonymize them.
        </p>

        <h2 className="text-xl font-semibold">Your choices</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Request access, correction, or deletion of your data</li>
          <li>Opt out of optional communications</li>
        </ul>

        <h2 className="text-xl font-semibold">Contact</h2>
        <p>
          Questions? Use the Contact link to reach us on WhatsApp.
        </p>

        <p className="text-xs opacity-70">This page is informational and not legal advice.</p>
      </section>
    </main>
  );
}
