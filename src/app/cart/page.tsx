export const metadata = {
  title: "Cart",
  alternates: { canonical: "/cart" },
}

import CartClient from "./CartClient"

export default function Page() {
  return <CartClient />
}
