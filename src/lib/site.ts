export function siteUrl(path: string = "/") {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  const slash = path.startsWith("/") ? "" : "/"
  return new URL(`${slash}${path}`, base).toString()
}
