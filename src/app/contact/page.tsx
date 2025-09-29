export const metadata = { title: "Contact" }

export default function ContactPage() {
  const num = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ""
  const link = num ? `https://wa.me/${num}` : null

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Contact</h1>
      {link ? (
        <p>
          WhatsApp us: <a className="underline" href={link} target="_blank" rel="noreferrer">{num}</a>
        </p>
      ) : (
        <p className="text-amber-600">
          Set <code>NEXT_PUBLIC_WHATSAPP_NUMBER</code> in <code>.env.local</code> to enable the WhatsApp button.
        </p>
      )}
    </section>
  )
}
