import Link from "next/link";
import { findValidResetToken } from "@/lib/passwordReset";
import ResetPasswordForm from "./ResetPasswordForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reset Password | Golden Triangle Peptides",
};

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const record = await findValidResetToken(token);

  if (!record) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <h1 className="font-serif text-2xl font-bold text-navy">
            Link expired or invalid
          </h1>
          <p className="mt-2 text-zinc-600">
            This password reset link is no longer valid. Please request a new
            one.
          </p>
        </div>
        <div className="mt-6 text-center text-sm">
          <Link
            href="/forgot-password"
            className="font-semibold text-navy hover:underline"
          >
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return <ResetPasswordForm token={token} email={record.user.email} />;
}
