"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit() {
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.error) return alert(res.error);
    window.location.href = "/";
  }

  return (
    <section className="space-y-4 max-w-sm">
      <h1 className="text-3xl font-bold">Sign in</h1>
      <input
        className="w-full rounded border px-3 py-2"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full rounded border px-3 py-2"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={submit}
        className="rounded-lg bg-primary text-white px-4 py-2"
      >
        Sign in
      </button>
    </section>
  );
}
