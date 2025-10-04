export default function Page() {
  // server component wrapper
  // If you need metadata here, we can add it safely later.
  // export const metadata = { title: "Admin Settings" }
  // If this route should never prerender, uncomment:
  // export const dynamic = "force-dynamic"
  // or: export const revalidate = 0
  // (keep it simple for now)
  // eslint-disable-next-line @next/next/no-html-link-for-pages
  return <SettingsClient />
}

import SettingsClient from "./SettingsClient"
