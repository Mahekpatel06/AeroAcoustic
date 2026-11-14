import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-4">
      <h2 className="text-3xl font-bold font-mono text-sky-400 mb-2">404 - Orbit Not Found</h2>
      <p className="text-sm text-slate-400 mb-6">The requested observation telemetry cannot be located.</p>
      <Link
        href="/"
        className="px-4 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-sky-400 transition-colors"
      >
        Return to SoniEarth Console
      </Link>
    </div>
  );
}
