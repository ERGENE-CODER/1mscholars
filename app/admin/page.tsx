"use client";

import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  FileText,
  GraduationCap,
  Mail,
  MoreVertical,
  Plus,
  Send,
  ShieldCheck,
  UserPlus,
  Users,
  Activity,
} from "lucide-react";

const opportunityTypes = [
  { name: "Scholarships", value: 62, color: "bg-blue-500" },
  { name: "Jobs", value: 38, color: "bg-teal-500" },
  { name: "Internships", value: 45, color: "bg-emerald-500" },
  { name: "Fellowships", value: 22, color: "bg-purple-500" },
  { name: "Training", value: 28, color: "bg-indigo-500" },
  { name: "Competitions", value: 15, color: "bg-orange-400" },
  { name: "Conferences", value: 12, color: "bg-violet-500" },
  { name: "Workshops", value: 9, color: "bg-cyan-500" },
  { name: "Grants", value: 7, color: "bg-pink-500" },
  { name: "Other", value: 10, color: "bg-slate-400" },
];

const recentApplications = [
  {
    name: "Grace Niyonsaba",
    opportunity: "Mastercard Foundation Scholarship",
    date: "24 Jun 2025",
    status: "Submitted",
    statusClass: "bg-blue-50 text-blue-600",
    avatar: "G",
  },
  {
    name: "Sylvestre Habimana",
    opportunity: "Tech Internship Program",
    date: "23 Jun 2025",
    status: "Under Review",
    statusClass: "bg-amber-50 text-amber-600",
    avatar: "S",
  },
  {
    name: "Aline Uwimana",
    opportunity: "AI Training Program",
    date: "22 Jun 2025",
    status: "Approved",
    statusClass: "bg-emerald-50 text-emerald-600",
    avatar: "A",
  },
  {
    name: "Jean Bosco Rukundo",
    opportunity: "Global Youth Fellowship",
    date: "21 Jun 2025",
    status: "Documents Required",
    statusClass: "bg-red-50 text-red-600",
    avatar: "J",
  },
  {
    name: "Carine Mukamana",
    opportunity: "Leadership Conference",
    date: "20 Jun 2025",
    status: "Submitted",
    statusClass: "bg-blue-50 text-blue-600",
    avatar: "C",
  },
];

const latestOpportunities = [
  {
    title: "Mastercard Foundation Scholarship",
    type: "Scholarship",
    organization: "Mastercard Foundation",
    deadline: "30 Sep 2026",
    status: "Active",
    image: "M",
  },
  {
    title: "Software Engineering Internship",
    type: "Internship",
    organization: "Google",
    deadline: "12 Oct 2025",
    status: "Active",
    image: "S",
  },
  {
    title: "AI Training Program",
    type: "Training",
    organization: "Coursera",
    deadline: "20 Oct 2025",
    status: "Draft",
    image: "A",
  },
  {
    title: "Global Youth Fellowship",
    type: "Fellowship",
    organization: "UNDP",
    deadline: "15 Nov 2025",
    status: "Active",
    image: "G",
  },
  {
    title: "Leadership Competition",
    type: "Competition",
    organization: "African Union",
    deadline: "10 Dec 2025",
    status: "Active",
    image: "L",
  },
];

const recentActivities = [
  {
    title: "New opportunity added",
    description: "Tech Internship Program",
    time: "2 hours ago",
    icon: BriefcaseBusiness,
    iconClass: "bg-emerald-50 text-emerald-500",
  },
  {
    title: "Application submitted",
    description: "Grace Niyonsaba",
    time: "3 hours ago",
    icon: FileText,
    iconClass: "bg-purple-50 text-purple-500",
  },
  {
    title: "Opportunity updated",
    description: "AI Training Program",
    time: "5 hours ago",
    icon: Activity,
    iconClass: "bg-orange-50 text-orange-500",
  },
  {
    title: "New subscriber",
    description: "james@example.com",
    time: "6 hours ago",
    icon: Mail,
    iconClass: "bg-emerald-50 text-emerald-500",
  },
  {
    title: "Status changed",
    description: "Application #APP-2025-0042",
    time: "8 hours ago",
    icon: CheckCircle2,
    iconClass: "bg-amber-50 text-amber-500",
  },
];

function StatCard({
  title,
  value,
  percentage,
  icon: Icon,
  iconClass,
}: {
  title: string;
  value: string;
  percentage: string;
  icon: React.ElementType;
  iconClass: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
      >
        <Icon size={22} />
      </div>

      <p className="text-sm font-medium text-slate-500">{title}</p>

      <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <div className="mt-3 flex items-center gap-2">
        <span className="text-sm font-semibold text-emerald-500">
          ↑ {percentage}
        </span>

        <span className="text-xs text-slate-400">vs last month</span>
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-base font-bold text-slate-900">{title}</h2>

      {action && (
        <button className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
          {action}
          <ArrowUpRight size={15} />
        </button>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      {/* =========================================================
          PAGE HEADER
      ========================================================== */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Welcome back, Administrator!
            </h1>
          </div>

          <p className="mt-1 text-sm text-slate-500 sm:text-base">
            Here's what's happening with 1M Scholars today.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <CalendarDays size={17} />
            <span>Tuesday, 24 June 2025</span>
          </div>

          <button className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
            <Plus size={18} />
            Add New Opportunity
          </button>
        </div>
      </div>

      {/* =========================================================
          STATISTICS
      ========================================================== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Opportunities"
          value="248"
          percentage="12%"
          icon={BriefcaseBusiness}
          iconClass="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Total Applications"
          value="1,432"
          percentage="18%"
          icon={Send}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Registered Users"
          value="3,216"
          percentage="24%"
          icon={Users}
          iconClass="bg-purple-50 text-purple-600"
        />

        <StatCard
          title="Subscribers"
          value="5,892"
          percentage="31%"
          icon={Mail}
          iconClass="bg-orange-50 text-orange-500"
        />
      </div>

      {/* =========================================================
          MAIN GRID
      ========================================================== */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        {/* LEFT CONTENT */}
        <div className="min-w-0 space-y-6">
          {/* =====================================================
              CHART + RECENT APPLICATIONS
          ====================================================== */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Opportunities by type */}
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHeader title="Opportunities by Type" />

              <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
                {/* Donut chart */}
                <div className="relative flex h-48 w-48 shrink-0 items-center justify-center">
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "conic-gradient(#3b82f6 0deg 90deg, #14b8a6 90deg 145deg, #10b981 145deg 210deg, #8b5cf6 210deg 242deg, #6366f1 242deg 283deg, #f59e0b 283deg 305deg, #7c3aed 305deg 322deg, #06b6d4 322deg 335deg, #ec4899 335deg 345deg, #94a3b8 345deg 360deg)",
                    }}
                  />

                  <div className="absolute inset-[30px] flex flex-col items-center justify-center rounded-full bg-white">
                    <span className="text-2xl font-bold text-slate-900">
                      248
                    </span>
                    <span className="text-xs text-slate-500">Total</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="grid w-full grid-cols-1 gap-2">
                  {opportunityTypes.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.color}`}
                        />
                        <span className="truncate text-slate-600">
                          {item.name}
                        </span>
                      </div>

                      <span className="font-medium text-slate-500">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Recent applications */}
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHeader title="Recent Applications" action="View all" />

              <div className="mt-4 divide-y divide-slate-100">
                {recentApplications.map((application) => (
                  <div
                    key={application.name}
                    className="flex items-center gap-3 py-3"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                      {application.avatar}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {application.name}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {application.opportunity}
                      </p>

                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {application.date}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${application.statusClass}`}
                    >
                      {application.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* =====================================================
              LATEST OPPORTUNITIES
          ====================================================== */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <SectionHeader title="Latest Opportunities" action="View all" />

              <button className="ml-4 hidden items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 sm:flex">
                <Plus size={15} />
                Add Opportunity
              </button>
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                      Image
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-slate-500">
                      Title
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-slate-500">
                      Type
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-slate-500">
                      Organization
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-slate-500">
                      Deadline
                    </th>
                    <th className="px-3 py-3 text-xs font-semibold text-slate-500">
                      Status
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {latestOpportunities.map((opportunity) => (
                    <tr
                      key={opportunity.title}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                    >
                      <td className="px-5 py-3">
                        <div className="flex h-10 w-12 items-center justify-center rounded-md bg-gradient-to-br from-blue-100 to-indigo-100 text-sm font-bold text-blue-700">
                          {opportunity.image}
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <p className="max-w-[230px] truncate text-xs font-semibold text-slate-800">
                          {opportunity.title}
                        </p>
                      </td>

                      <td className="px-3 py-3 text-xs text-slate-500">
                        {opportunity.type}
                      </td>

                      <td className="px-3 py-3 text-xs text-slate-500">
                        {opportunity.organization}
                      </td>

                      <td className="px-3 py-3 text-xs text-slate-500">
                        {opportunity.deadline}
                      </td>

                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                            opportunity.status === "Active"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {opportunity.status}
                        </span>
                      </td>

                      <td className="px-5 py-3">
                        <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                          <MoreVertical size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-slate-100 md:hidden">
              {latestOpportunities.map((opportunity) => (
                <div
                  key={opportunity.title}
                  className="flex items-center gap-3 p-4"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-blue-50 font-bold text-blue-600">
                    {opportunity.image}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {opportunity.title}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {opportunity.organization}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">
                        {opportunity.deadline}
                      </span>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          opportunity.status === "Active"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {opportunity.status}
                      </span>
                    </div>
                  </div>

                  <MoreVertical size={17} className="text-slate-400" />
                </div>
              ))}
            </div>
          </section>

          {/* =====================================================
              BOTTOM PROMOTIONAL CARD
          ====================================================== */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr]">
              <div className="flex min-h-[190px] items-center justify-center bg-gradient-to-br from-emerald-100 via-blue-100 to-indigo-100">
                <GraduationCap
                  size={80}
                  strokeWidth={1.2}
                  className="text-blue-600"
                />
              </div>

              <div className="flex flex-col justify-center p-6">
                <h2 className="text-xl font-bold text-slate-900">
                  Empowering the Next Generation
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  1M Scholars connects talented individuals with life-changing
                  opportunities around the world. Together, we build brighter
                  futures.
                </p>

                <div className="mt-5">
                  <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                    View Website
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* =======================================================
            RIGHT SIDEBAR
        ======================================================== */}
        <aside className="space-y-6">
          {/* Quick Actions */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">
              Quick Actions
            </h2>

            <div className="mt-4 space-y-2">
              <button className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition hover:bg-slate-50">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Plus size={18} />
                </span>

                <span className="text-sm font-medium text-slate-700">
                  Add Opportunity
                </span>
              </button>

              <button className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition hover:bg-slate-50">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <FileText size={18} />
                </span>

                <span className="text-sm font-medium text-slate-700">
                  View Applications
                </span>
              </button>

              <button className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition hover:bg-slate-50">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <UserPlus size={18} />
                </span>

                <span className="text-sm font-medium text-slate-700">
                  Manage Users
                </span>
              </button>
              <button className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition hover:bg-slate-50">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Mail size={18} />
                </span>

                <span className="text-sm font-medium text-slate-700">
                  Send Notification
                </span>
              </button>
            </div>
          </section>

          {/* Recent Activities */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <SectionHeader title="Recent Activities" action="View all" />

            <div className="mt-4 space-y-1">
              {recentActivities.map((activity) => {
                const Icon = activity.icon;

                return (
                  <div
                    key={activity.title}
                    className="flex gap-3 rounded-lg p-2.5 hover:bg-slate-50"
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${activity.iconClass}`}
                    >
                      <Icon size={17} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800">
                        {activity.title}
                      </p>

                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {activity.description}
                      </p>

                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Platform statistics */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <GraduationCap size={20} />
                </div>

                <div>
                  <p className="text-lg font-bold text-slate-900">1000+</p>
                  <p className="text-xs text-slate-500">
                    Opportunities Published
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <BriefcaseBusiness size={20} />
                </div>

                <div>
                  <p className="text-lg font-bold text-slate-900">50+</p>
                  <p className="text-xs text-slate-500">
                    Partner Organizations
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                  <ShieldCheck size={20} />
                </div>

                <div>
                  <p className="text-lg font-bold text-slate-900">1M+</p>
                  <p className="text-xs text-slate-500">Lives Impacted</p>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}