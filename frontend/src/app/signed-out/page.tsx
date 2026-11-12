import Link from "next/link";

export default function SignedOutPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-grid p-6">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-white p-8 text-center shadow-sm">
        <h1 className="text-[18px] font-bold text-ink">You have been signed out</h1>
        <p className="mt-2 text-[13px] text-muted">
          Sign-in will be connected when the reporting API is live.
        </p>
        <Link
          href="/finance/overview"
          className="mt-6 inline-block rounded-lg bg-brand-blue px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-blue/90"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
