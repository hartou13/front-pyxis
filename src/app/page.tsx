import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-12 bg-gradient-to-br from-slate-50/80 via-white to-slate-100/60 px-6 py-24 dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950 overflow-hidden">
      {/* Animated background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-teal-200/20 to-cyan-200/20 rounded-full blur-3xl dark:from-teal-900/10 dark:to-cyan-900/10 animate-pulse-glow"></div>
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-gradient-to-tr from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl dark:from-indigo-900/10 dark:to-purple-900/10 animate-pulse-glow" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="relative text-center max-w-2xl z-10">
        <div className="mb-6 inline-block animate-slide-up">
          <div className="rounded-full bg-gradient-to-r from-teal-100 to-cyan-100 dark:from-teal-950/40 dark:to-cyan-950/40 px-4 py-2 text-sm font-bold uppercase tracking-widest text-teal-700 dark:text-teal-300 ring-1 ring-teal-300/30 dark:ring-teal-700/30">
            ✨ Financial Clarity
          </div>
        </div>

        <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-slate-50 mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          Pyxis
        </h1>

        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed mb-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          Manage your finances with <span className="font-bold text-teal-600 dark:text-teal-400">precision</span> and <span className="font-bold text-indigo-600 dark:text-indigo-400">clarity</span>. Track accounts, monitor transactions, and visualize your spending patterns in real-time.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <Link
            href="/login"
            className="rounded-xl bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 hover:from-teal-600 hover:via-teal-700 hover:to-teal-800 px-8 py-4 text-lg font-bold text-white transition-smooth hover:shadow-2xl hover:-translate-y-1 dark:from-teal-600 dark:via-teal-700 dark:to-teal-800 dark:hover:from-teal-700 dark:hover:via-teal-800 dark:hover:to-teal-900 elevation-2"
          >
            🚀 Get Started
          </Link>
          <Link
            href="/login"
            className="rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm hover:bg-slate-50 dark:hover:bg-slate-800 px-8 py-4 text-lg font-bold text-slate-900 dark:text-slate-50 transition-smooth hover:shadow-xl hover:border-slate-400 dark:hover:border-slate-500"
          >
            Learn More
          </Link>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 w-full max-w-4xl animate-fade-in" style={{ animationDelay: "0.4s" }}>
        <div className="group relative rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-8 border border-slate-200/50 dark:border-slate-700/50 hover:border-teal-300 dark:hover:border-teal-700 transition-smooth hover:shadow-xl hover:-translate-y-1 elevation-1">
          <div className="text-4xl mb-3">💰</div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            Multi-Account
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Track personal, external, and joint accounts all in one unified dashboard.
          </p>
        </div>

        <div className="group relative rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-8 border border-slate-200/50 dark:border-slate-700/50 hover:border-emerald-300 dark:hover:border-emerald-700 transition-smooth hover:shadow-xl hover:-translate-y-1 elevation-1">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            Real-time Insights
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Visualize income, expenses, and transfers with beautiful charts and analytics.
          </p>
        </div>

        <div className="group relative rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-8 border border-slate-200/50 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-700 transition-smooth hover:shadow-xl hover:-translate-y-1 elevation-1">
          <div className="text-4xl mb-3">⚡</div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            Lightning Fast
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Smooth animations and instant updates keep you in control of your finances.
          </p>
        </div>
      </div>
    </div>
  );
}
