import type { Metadata } from "next";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <h1 className="text-3xl font-bold text-forest">Editor sign in</h1>
      <p className="mt-2 text-sm text-stone">For site editors only.</p>
      <SignInForm />
    </div>
  );
}
