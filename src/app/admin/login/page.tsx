
import { useState } from "react"

export default function AdminLogin() {
  const [pwd, setPwd] = useState("")
  async function submit() {
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify({ password: pwd }) })
    if (r.ok) window.location.href = "/admin"
    else alert("Wrong password")
  }
  return (
    <section className="space-y-4 max-w-sm">
      <h1 className="text-3xl font-bold">Admin Login</h1>
      <input className="w-full rounded border px-3 py-2" type="password" placeholder="Password" value={pwd} onChange={e=>setPwd(e.target.value)}/>
      <button onClick={submit} className="rounded-lg bg-primary text-white px-4 py-2">Enter</button>
    </section>
  )
}
