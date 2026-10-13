import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  FileText,
  GraduationCap,
  Mail,
  Plus,
  Send,
  ShieldCheck,
  UserPlus,
  Users,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { requireAdmin, timeAgo, formatDate } from "@/lib/admin";
import { categoryKey } from "@/lib/opportunities";
import { statusMeta } from "@/lib/application-status";
import { Badge } from "./_components/ui";

export const metadata = { title: "Dashboard | Admin" };

const COLORS = ["#3b82f6", "#14b8a6", "#10b981", "#8b5cf6", "#6366f1", "#f59e0b", "#06b6d4", "#ec4899"];
const OTHER_COLOR = "#94a3b8";

type Opp = { id: number; title: string; organization: string; category: string | null; deadline: string | null; status: string; created_at: string };
type App = { id: number; opportunity_id: number; applicant_id: string | null; status: string | null; submitted_at: string | null };
type Msg = { id: number; name: string; subject: string | null; created_at: string };

function StatCard({ title, value, sub, icon: Icon, iconClass, href }: { title: string; value: number; sub: string; icon: LucideIcon; iconClass: string; href: string }) {
  return (
    <Link href={href} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}><Icon size={22} /></div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{value.toLocaleString("en-GB")}</p>
      <p className="mt-3 text-xs text-slate-400">{sub}</p>
    </Link>
  );
}

function SectionHeader({ title, href, action }: { title: string; href?: string; action?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      {href && action && (
        <Link href={href} className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
          {action} <ArrowUpRight size={15} />
        </Link>
      )}
    </div>
  );
}

export default async function AdminDashboard() {
  const { supabase, userId } = await requireAdmin();

  const [me, oppsRes, totalApps, doneApps, users, messages, recentAppsRes, recentMsgsRes] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle(),
    supabase.from("opportunities").select("id, title, organization, category, deadline, status, created_at").order("created_at", { ascending: false }).limit(500),
    supabase.from("applications").select("id", { count: "exact", head: true }),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("contact_messages").select("id", { count: "exact", head: true }),
    supabase.from("applications").select("id, opportunity_id, applicant_id, status, submitted_at").order("submitted_at", { ascending: false, nullsFirst: false }).limit(5),
    supabase.from("contact_messages").select("id, name, subject, created_at").order("created_at", { ascending: false }).limit(3),
  ]);

  const opps = (oppsRes.data ?? []) as Opp[];
  const recentApps = (recentAppsRes.data ?? []) as App[];
  const recentMsgs = (recentMsgsRes.data ?? []) as Msg[];
  const loadError = oppsRes.error ?? totalApps.error ?? users.error;

  // Names for the recent applications list.
  const people = new Map<string, string>();
  const applicantIds = [...new Set(recentApps.map((a) => a.applicant_id).filter((v): v is string => !!v))];
  if (applicantIds.length) {
    const { data } = await supabase.from("profiles").select("id, full_name, email").in("id", applicantIds);
    for (const p of data ?? []) people.set(p.id, p.full_name || p.email || "Applicant");
  }
  const titles = new Map(opps.map((o) => [o.id, o.title]));
  const missing = [...new Set(recentApps.map((a) => a.opportunity_id))].filter((id) => !titles.has(id));
  if (missing.length) {
    const { data } = await supabase.from("opportunities").select("id, title").in("id", missing);
    for (const o of data ?? []) titles.set(o.id, o.title);
  }

  // Opportunities by category (singular/plural spellings are merged).
  const groups = new Map<string, { name: string; count: number }>();
  for (const o of opps) {
    const name = o.category?.trim() || "Uncategorised";
    const key = categoryKey(name);
    const g = groups.get(key);
    if (g) g.count += 1;
    else groups.set(key, { name, count: 1 });
  }
  const sorted = [...groups.values()].sort((a, b) => b.count - a.count);
  const top = sorted.slice(0, COLORS.length).map((g, i) => ({ ...g, color: COLORS[i] }));
  const rest = sorted.slice(COLORS.length).reduce((n, g) => n + g.count, 0);
  const legend = rest ? [...top, { name: "Other", count: rest, color: OTHER_COLOR }] : top;
  let angle = 0;
  const stops = legend.map((s) => {
    const start = angle;
    angle += (s.count / Math.max(opps.length, 1)) * 360;
    return `${s.color} ${start}deg ${angle}deg`;
  });
  const donut = legend.length ? `conic-gradient(${stops.join(", ")})` : "#e2e8f0";

  const published = opps.filter((o) => o.status === "published");
  const drafts = opps.filter((o) => o.status === "draft").length;
  const partners = new Set(published.map((o) => o.organization.trim().toLowerCase())).size;

  // Recent activity: newest of applications, opportunities and messages.
  const activity: { key: string; title: string; description: string; at: string; icon: LucideIcon; iconClass: string }[] = [
    ...recentApps.filter((a) => a.submitted_at).map((a) => ({ key: `a${a.id}`, title: "Application submitted", description: `${a.applicant_id ? people.get(a.applicant_id) ?? "Applicant" : "Guest"} · ${titles.get(a.opportunity_id) ?? `#${a.opportunity_id}`}`, at: a.submitted_at as string, icon: FileText, iconClass: "bg-purple-50 text-purple-500" })),
    ...opps.slice(0, 4).map((o) => ({ key: `o${o.id}`, title: "Opportunity added", description: o.title, at: o.created_at, icon: BriefcaseBusiness, iconClass: "bg-emerald-50 text-emerald-500" })),
    ...recentMsgs.map((m) => ({ key: `m${m.id}`, title: "New message", description: `${m.name}${m.subject ? ` · ${m.subject}` : ""}`, at: m.created_at, icon: Mail, iconClass: "bg-orange-50 text-orange-500" })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 6);

  const firstName = me.data?.full_name?.trim().split(/\s+/)[0];
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Kigali" });

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Welcome back{firstName ? `, ${firstName}` : ""}!</h1>
          <p className="mt-1 text-sm text-slate-500 sm:text-base">Here&apos;s what&apos;s happening with 1M Scholars today.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-sm text-slate-500"><CalendarDays size={17} /><span>{today}</span></div>
          <Link href="/admin/opportunities/new" className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
            <Plus size={18} /> Add New Opportunity
          </Link>
        </div>
      </div>

      {loadError && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Some figures couldn&apos;t be loaded: {loadError.message}. If this says permission denied, run supabase/admin-panel.sql in the Supabase SQL editor.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Opportunities" value={opps.length} sub={`${published.length} published · ${drafts} draft${drafts === 1 ? "" : "s"}`} icon={BriefcaseBusiness} iconClass="bg-blue-50 text-blue-600" href="/admin/opportunities" />
        <StatCard title="Total Applications" value={totalApps.count ?? 0} sub={`${doneApps.count ?? 0} completed`} icon={Send} iconClass="bg-emerald-50 text-emerald-600" href="/admin/applications" />
        <StatCard title="Registered Users" value={users.count ?? 0} sub="Manage accounts and roles" icon={Users} iconClass="bg-purple-50 text-purple-600" href="/admin/users" />
        <StatCard title="Messages" value={messages.count ?? 0} sub="From the Contact page" icon={Mail} iconClass="bg-orange-50 text-orange-500" href="/admin/messages" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHeader title="Opportunities by Type" />
              <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
                <div className="relative flex h-48 w-48 shrink-0 items-center justify-center">
                  <div className="absolute inset-0 rounded-full" style={{ background: donut }} />
                  <div className="absolute inset-[30px] flex flex-col items-center justify-center rounded-full bg-white">
                    <span className="text-2xl font-bold text-slate-900">{opps.length}</span>
                    <span className="text-xs text-slate-500">Total</span>
                  </div>
                </div>
                <div className="grid w-full grid-cols-1 gap-2">
                  {legend.length === 0 && <p className="text-xs text-slate-400">No opportunities yet.</p>}
                  {legend.map((item) => (
                    <div key={item.name} className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="truncate text-slate-600">{item.name}</span>
                      </div>
                      <span className="font-medium text-slate-500">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <SectionHeader title="Recent Applications" href="/admin/applications" action="View all" />
              {recentApps.length === 0 ? (
                <p className="mt-4 text-sm text-slate-400">No applications yet.</p>
              ) : (
                <div className="mt-4 divide-y divide-slate-100">
                  {recentApps.map((a) => {
                    const name = a.applicant_id ? people.get(a.applicant_id) ?? "Applicant" : "Guest applicant";
                    const m = statusMeta(a.status);
                    return (
                      <Link key={a.id} href={`/admin/applications/${a.id}`} className="flex items-center gap-3 py-3 hover:bg-slate-50/60">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">{name.charAt(0).toUpperCase()}</div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800">{name}</p>
                          <p className="truncate text-xs text-slate-500">{titles.get(a.opportunity_id) ?? `Opportunity #${a.opportunity_id}`}</p>
                          <p className="mt-0.5 text-[11px] text-slate-400">{timeAgo(a.submitted_at)}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${m.className}`}>{m.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <SectionHeader title="Latest Opportunities" href="/admin/opportunities" action="View all" />
              <Link href="/admin/opportunities/new" className="ml-4 hidden items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 sm:flex"><Plus size={15} /> Add Opportunity</Link>
            </div>
            {opps.length === 0 ? (
              <p className="p-5 text-sm text-slate-400">Nothing here yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-left text-xs font-semibold text-slate-500">
                      <th className="px-5 py-3">Title</th><th className="px-3 py-3">Type</th><th className="px-3 py-3">Organization</th><th className="px-3 py-3">Deadline</th><th className="px-3 py-3">Status</th><th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {opps.slice(0, 5).map((o) => (
                      <tr key={o.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                        <td className="px-5 py-3"><p className="max-w-[260px] truncate text-xs font-semibold text-slate-800">{o.title}</p></td>
                        <td className="px-3 py-3 text-xs text-slate-500">{o.category || "—"}</td>
                        <td className="px-3 py-3 text-xs text-slate-500">{o.organization}</td>
                        <td className="px-3 py-3 text-xs text-slate-500">{formatDate(o.deadline)}</td>
                        <td className="px-3 py-3"><Badge value={o.status} /></td>
                        <td className="px-5 py-3 text-right"><Link href={`/admin/opportunities/${o.id}/edit`} className="text-xs font-semibold text-blue-600">Edit</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr]">
              <div className="flex min-h-[190px] items-center justify-center bg-gradient-to-br from-emerald-100 via-blue-100 to-indigo-100">
                <GraduationCap size={80} strokeWidth={1.2} className="text-blue-600" />
              </div>
              <div className="flex flex-col justify-center p-6">
                <h2 className="text-xl font-bold text-slate-900">Empowering the Next Generation</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">1M Scholars connects talented individuals with life-changing opportunities around the world. Together, we build brighter futures.</p>
                <div className="mt-5">
                  <Link href="/" target="_blank" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">View Website <ArrowUpRight size={16} /></Link>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">Quick Actions</h2>
            <div className="mt-4 space-y-2">
              {[
                { href: "/admin/opportunities/new", label: "Add Opportunity", icon: Plus },
                { href: "/admin/applications", label: "View Applications", icon: FileText },
                { href: "/admin/users", label: "Manage Users", icon: UserPlus },
                { href: "/admin/messages", label: "Read Messages", icon: Mail },
              ].map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition hover:bg-slate-50">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Icon size={18} /></span>
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">Recent Activity</h2>
            {activity.length === 0 ? (
              <p className="mt-4 text-sm text-slate-400">Nothing yet.</p>
            ) : (
              <div className="mt-4 space-y-1">
                {activity.map((a) => {
                  const Icon = a.icon;
                  return (
                    <div key={a.key} className="flex gap-3 rounded-lg p-2.5 hover:bg-slate-50">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${a.iconClass}`}><Icon size={17} /></div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800">{a.title}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">{a.description}</p>
                        <p className="mt-0.5 text-[10px] text-slate-400">{timeAgo(a.at)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="space-y-5">
              {[
                { value: published.length, label: "Opportunities Published", icon: GraduationCap, cls: "bg-blue-50 text-blue-600" },
                { value: partners, label: "Partner Organizations", icon: BriefcaseBusiness, cls: "bg-blue-50 text-blue-600" },
                { value: doneApps.count ?? 0, label: "Applications Completed", icon: CheckCircle2, cls: "bg-purple-50 text-purple-600" },
              ].map(({ value, label, icon: Icon, cls }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${cls}`}><Icon size={20} /></div>
                  <div>
                    <p className="text-lg font-bold text-slate-900">{value.toLocaleString("en-GB")}</p>
                    <p className="text-xs text-slate-500">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <p className="flex items-center gap-2 px-1 text-[11px] text-slate-400"><ShieldCheck size={13} /> Figures update every time you open this page.</p>
        </aside>
      </div>
    </div>
  );
}
