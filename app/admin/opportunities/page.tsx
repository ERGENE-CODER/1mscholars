"use client";

import { Plus, Search, Filter } from "lucide-react";

export default function OpportunitiesPage() {
  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Opportunities
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage all opportunities available to students.
          </p>
        </div>

        <button className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
          <Plus size={18} />
          Add Opportunity
        </button>
      </div>

      {/* Search and filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="flex flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5">
            <Search size={18} className="text-slate-400" />

            <input
              type="text"
              placeholder="Search opportunities..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>

          <button className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Filter size={18} />
            Filters
          </button>
        </div>
      </div>

      {/* Opportunities content */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">
          All Opportunities
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Your opportunities will appear here.
        </p>
      </div>
    </div>
  );
}