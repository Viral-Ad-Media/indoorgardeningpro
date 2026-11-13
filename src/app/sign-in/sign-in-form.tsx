"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "@/lib/auth-client";

export function SignInForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const { error } = await signIn.email({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setPending(false);
    if (error) {
      setError(error.message ?? "Sign in failed.");
      return;
    }
    router.push("/admin/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-forest">Email</span>
        <input name="email" type="email" required autoComplete="email" className="mt-1 w-full rounded-lg border border-leaf-200 bg-white px-3 py-2 focus:border-leaf-500 focus:outline-none focus:ring-2 focus:ring-leaf-200" />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-forest">Password</span>
        <input name="password" type="password" required autoComplete="current-password" className="mt-1 w-full rounded-lg border border-leaf-200 bg-white px-3 py-2 focus:border-leaf-500 focus:outline-none focus:ring-2 focus:ring-leaf-200" />
      </label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button disabled={pending} className="w-full rounded-full bg-leaf-700 px-4 py-2.5 font-semibold text-white hover:bg-leaf-800 disabled:opacity-60">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
