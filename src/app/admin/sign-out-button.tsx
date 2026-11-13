"use client";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await signOut();
        router.push("/");
        router.refresh();
      }}
      className="rounded-full px-3 py-1 ring-1 ring-leaf-200 hover:bg-leaf-50"
    >
      Sign out
    </button>
  );
}
