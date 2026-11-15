import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#06080A] text-slate-100 p-4">
      <h2 className="text-3xl font-bold font-mono text-emerald-400 mb-2 drop-shadow-[0_0_15px_rgba(0,245,155,0.4)]">404 - Orbit Not Found</h2>
      <p className="text-sm text-slate-400 mb-6 font-mono">The requested observation telemetry cannot be located.</p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-300 to-[#00F59B] text-slate-950 font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_20px_rgba(0,245,155,0.5)] transition-all"
      >
        Return to SoniEarth Console
      </Link>
    </div>
  );
}
