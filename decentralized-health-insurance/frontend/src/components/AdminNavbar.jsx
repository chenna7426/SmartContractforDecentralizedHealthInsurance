import React, { useState } from "react";

const defaultMenuItems = [
  { id: "dashboard", label: "Dashboard" },
  { id: "manage-claims", label: "Manage Claims" },
  { id: "claims", label: "Patient Claims" },
  { id: "approve", label: "Approve Claims" },
  { id: "rejected", label: "Rejected Claims" },
  { id: "policies", label: "Insurance Policies" },
  { id: "users", label: "Users" },
  { id: "transactions", label: "Blockchain Transactions" },
];

function AdminNavbar({
  activeSection,
  onNavigate,
  onLogout,
  theme,
  onThemeToggle,
  stats,
  menuItems = defaultMenuItems,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDark = theme === "dark";

  const buttonBase =
    "rounded-full border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2";

  return (
    <div className={`${isDark ? "bg-slate-950 text-white" : "bg-white text-slate-900"} sticky top-0 z-20 border-b ${isDark ? "border-slate-800" : "border-slate-200"}`}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-blue-500">Admin Console</p>
          <h1 className="mt-1 text-lg font-bold sm:text-xl">Approve or Reject Insurance Claims</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onThemeToggle}
            className={`${buttonBase} ${isDark ? "border-slate-700 bg-slate-900 text-slate-100" : "border-slate-200 bg-slate-100 text-slate-800"}`}
          >
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600"
          >
            Logout
          </button>

          <button
            type="button"
            aria-label="Toggle admin menu"
            onClick={() => setMobileOpen((current) => !current)}
            className={`${buttonBase} md:hidden ${isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-slate-100"}`}
          >
            ☰
          </button>
        </div>

        <nav className={`w-full md:w-auto ${mobileOpen ? "block" : "hidden md:block"}`}>
          <div className="flex flex-col gap-2 pt-2 md:flex-row md:items-center md:pt-0">
            {menuItems.map((item) => {
              const active = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id, item.route)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-blue-600 text-white"
                      : isDark
                        ? "text-slate-200 hover:bg-slate-800"
                        : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      <div className={`border-t ${isDark ? "border-slate-800" : "border-slate-100"}`}>
        <div className="mx-auto flex max-w-7xl flex-wrap gap-3 px-4 py-3 text-sm sm:px-6 lg:px-8">
          <span className={`rounded-full px-3 py-1 ${isDark ? "bg-slate-900" : "bg-slate-100"}`}>Pending: {stats.pending}</span>
          <span className={`rounded-full px-3 py-1 ${isDark ? "bg-slate-900" : "bg-slate-100"}`}>Approved: {stats.approved}</span>
          <span className={`rounded-full px-3 py-1 ${isDark ? "bg-slate-900" : "bg-slate-100"}`}>Rejected: {stats.rejected}</span>
        </div>
      </div>
    </div>
  );
}

export default AdminNavbar;
