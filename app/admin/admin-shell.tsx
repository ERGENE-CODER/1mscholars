"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  FileText,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  Search,
  Bell,
  Menu,
  X,
  GraduationCap,
  Building2,
  Code2,
  Handshake,
  BookOpen,
  Trophy,
  UserPlus,
  Image,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";
import { signOut } from "@/app/login/actions";

/* =========================================================
   OPPORTUNITIES SUBMENU
   ========================================================= */

const opportunityItems = [
  {
    name: "All Opportunities",
    href: "/admin/opportunities",
    icon: null,
  },
  {
    name: "Scholarships",
    href: "/admin/opportunities/scholarships",
    icon: GraduationCap,
  },
  {
    name: "Jobs",
    href: "/admin/opportunities/jobs",
    icon: Building2,
  },
  {
    name: "Internships",
    href: "/admin/opportunities/internships",
    icon: Code2,
  },
  {
    name: "Fellowships",
    href: "/admin/opportunities/fellowships",
    icon: Handshake,
  },
  {
    name: "Training",
    href: "/admin/opportunities/training",
    icon: BookOpen,
  },
  {
    name: "Competitions",
    href: "/admin/opportunities/competitions",
    icon: Trophy,
  },
];

/* =========================================================
   MAIN ADMIN NAVIGATION
   ========================================================= */

const mainNavigation = [
  {
    name: "Applications",
    href: "/admin/applications",
    icon: FileText,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Subscribers",
    href: "/admin/subscribers",
    icon: UserPlus,
  },
  {
    name: "Media",
    href: "/admin/media",
    icon: Image,
  },
  {
    name: "Consultations",
    href: "/admin/consultations",
    icon: MessageSquare,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

/* =========================================================
   ADMIN SHELL (sidebar + top bar)
   ========================================================= */

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [opportunitiesOpen, setOpportunitiesOpen] = useState(
    pathname.startsWith("/admin/opportunities")
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#071a33] text-white transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* LOGO */}

        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#071a33]">
            <span className="text-xl font-bold">1M</span>
          </div>

          <div className="min-w-0">
            <h1 className="text-lg font-bold">1M Scholars</h1>

            <p className="text-xs leading-4 text-slate-400">
              More Opportunities, Brighter Futures
            </p>
          </div>

          {/* Mobile close button */}

          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION */}

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {/* DASHBOARD */}

          <Link
            href="/admin"
            onClick={() => setSidebarOpen(false)}
            className={`mb-2 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
              pathname === "/admin"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <LayoutDashboard size={19} />

            <span>Dashboard</span>
          </Link>

          {/* OPPORTUNITIES */}

          <div className="mb-2">
            <button
              onClick={() => setOpportunitiesOpen(!opportunitiesOpen)}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                pathname.startsWith("/admin/opportunities")
                  ? "text-white"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <BriefcaseBusiness size={19} />

              <span className="flex-1 text-left">Opportunities</span>

              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${
                  opportunitiesOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* OPPORTUNITIES SUBMENU */}

            {opportunitiesOpen && (
              <div className="mt-1 space-y-1 pl-4">
                {opportunityItems.map((item) => {
                  const active = pathname === item.href;

                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                        active
                          ? "bg-blue-600/20 text-blue-400"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {/* Small bullet for All Opportunities */}

                      {!Icon && (
                        <span
                          className={`h-2 w-2 rounded-full ${
                            active ? "bg-blue-400" : "bg-slate-500"
                          }`}
                        />
                      )}

                      {Icon && <Icon size={15} />}

                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* OTHER ADMIN NAVIGATION */}

          <div className="space-y-2">
            {mainNavigation.map((item) => {
              const Icon = item.icon;

              const active =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={19} />

                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* LOGOUT */}

        <div className="border-t border-white/10 p-4">
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-300 hover:bg-white/10 hover:text-white"
            >
              <LogOut size={18} />

              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* MAIN AREA */}

      <div className="lg:pl-64">
        {/* TOP HEADER */}

        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
          {/* Left side */}

          <div className="flex items-center gap-4">
            {/* Mobile menu */}

            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={22} />
            </button>

            {/* Search */}

            <div className="hidden w-[420px] items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 md:flex">
              <Search size={19} className="text-slate-400" />

              <input
                type="text"
                placeholder="Search opportunities, users, applications..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />

              <span className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-400">
                Ctrl K
              </span>
            </div>
          </div>

          {/* HEADER RIGHT */}

          <div className="flex items-center gap-4">
            {/* Notifications */}

            <button className="relative rounded-lg p-2.5 hover:bg-slate-100">
              <Bell size={21} className="text-slate-600" />

              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                3
              </span>
            </button>

            {/* Divider */}

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            {/* Administrator */}

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                A
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-800">
                  Administrator
                </p>

                <p className="text-xs text-slate-500">Administrator</p>
              </div>

              <ChevronDown size={16} className="text-slate-500" />
            </div>
          </div>
        </header>

        {/* PAGE CONTENT: every page inside /admin appears here. */}

        <main className="min-h-[calc(100vh-5rem)] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}