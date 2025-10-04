export const metadata = {
  title: "Contact",
  alternates: { canonical: "/contact" },
}

import ContactClient from "./contact-client"

export default function Page() {
  return <ContactClient />
}
