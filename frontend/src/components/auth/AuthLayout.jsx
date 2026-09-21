import { ShieldCheck, TrendingUp, Lock, Sun, Moon, ArrowUpRight } from 'lucide-react'

export default function AuthLayout({ children, theme, onToggleTheme, title, subtitle }) {
  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#0d0f14] flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      {/* Top Floating Controls */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 flex items-center gap-2">
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-gray-600 shadow-sm border border-gray-200 hover:bg-gray-50 dark:bg-[#181b22] dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
          </button>
        )}
      </div>

      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Fintech Showcase (Visible on Large Screens) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between space-y-8 pr-4">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 font-heading text-xl font-extrabold text-white shadow-lg shadow-orange-500/25">
                P<span className="text-amber-200">·</span>
              </div>
              <div>
                <h1 className="font-heading font-extrabold text-xl tracking-tight text-gray-900 dark:text-white">
                  Portfolio CRM
                </h1>
                <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 tracking-wider uppercase">
                  Personal Wealth Manager
                </p>
              </div>
            </div>

            <h2 className="font-heading text-3xl font-extrabold text-gray-950 dark:text-white tracking-tight leading-tight">
              Intelligent wealth tracking for private investors.
            </h2>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Consolidate Indian equities, mutual funds, ETFs, emergency reserves, and fixed deposits into a clean, modern financial dashboard.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-gray-200/80 bg-white/70 p-3.5 backdrop-blur-sm dark:border-gray-800 dark:bg-[#181b22]/70">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400 flex-shrink-0">
                <TrendingUp size={16} />
              </div>
              <div>
                <h4 className="font-heading font-bold text-xs text-gray-900 dark:text-white">Real-Time Position Tracking</h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">P&L, percentage returns, and dynamic asset class diversification.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-gray-200/80 bg-white/70 p-3.5 backdrop-blur-sm dark:border-gray-800 dark:bg-[#181b22]/70">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex-shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div>
                <h4 className="font-heading font-bold text-xs text-gray-900 dark:text-white">User Data Isolation</h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Authenticated sessions and dedicated per-user portfolio records.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center gap-2 text-xs text-gray-500">
            <Lock size={13} className="text-emerald-500" />
            <span>Protected with Firebase Authentication &amp; TLS Encryption</span>
          </div>
        </div>

        {/* Right Column: Authentication Form Card */}
        <div className="lg:col-span-7 w-full max-w-md mx-auto">
          {/* Mobile Brand Header */}
          <div className="flex lg:hidden items-center justify-center gap-2.5 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 font-heading text-lg font-extrabold text-white shadow-md shadow-orange-500/25">
              P<span className="text-amber-200">·</span>
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-lg text-gray-900 dark:text-white">
                Portfolio CRM
              </h1>
            </div>
          </div>

          <div className="crm-card bg-white dark:bg-[#181b22] p-6 sm:p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-200/80 dark:border-gray-800">
            {(title || subtitle) && (
              <div className="mb-6">
                {title && (
                  <h2 className="font-heading text-2xl font-extrabold tracking-tight text-gray-950 dark:text-white">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>
            )}

            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
