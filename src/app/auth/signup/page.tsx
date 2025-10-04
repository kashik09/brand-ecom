
import { useState } from "react"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")

  async function submit() {
    const r = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, fullName, phone }),
    })
    if (!r.ok) return alert((await r.json()).error || "Signup failed")
    alert("Account created. You can sign in now.")
    window.location.href = "/auth/login"
  }

  return (
    <section className="space-y-4 max-w-sm">
      <h1 className="text-3xl font-bold">Create account</h1>
      <input className="w-full rounded border px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="w-full rounded border px-3 py-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <input className="w-full rounded border px-3 py-2" placeholder="Full name (optional)" value={fullName} onChange={e=>setFullName(e.target.value)} />
      <input className="w-full rounded border px-3 py-2" placeholder="Phone (optional)" value={phone} onChange={e=>setPhone(e.target.value)} />
      <button onClick={submit} className="rounded-lg bg-primary text-white px-4 py-2">Sign up</button>
    </section>
  )
}
