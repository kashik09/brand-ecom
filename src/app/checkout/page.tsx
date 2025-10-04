export const metadata = {
  title: "Checkout",
  alternates: { canonical: "/checkout" },
}

import CheckoutClient from "./CheckoutClient"

export default function Page() {
  return <CheckoutClient />
}
