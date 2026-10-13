"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { inputClass } from "./ui";

/**
 * A list of text lines the admin can add to / remove.
 * Each line is submitted as a repeated form field called `name`, in order.
 */
export default function StringListEditor({
  name,
  initial,
  placeholder,
  addLabel,
}: {
  name: string;
  initial: string[];
  placeholder?: string;
  addLabel: string;
}) {
  // Stable keys so removing a middle row doesn't shuffle what's typed in the others.
  const [rows, setRows] = useState(() =>
    (initial.length ? initial : [""]).map((value, i) => ({ key: i, value }))
  );
  const [nextKey, setNextKey] = useState(rows.length);

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.key} className="flex gap-2">
          <input
            name={name}
            value={row.value}
            onChange={(e) =>
              setRows((prev) => prev.map((r) => (r.key === row.key ? { ...r, value: e.target.value } : r)))
            }
            placeholder={placeholder}
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => setRows((prev) => (prev.length === 1 ? [{ ...prev[0], value: "" }] : prev.filter((r) => r.key !== row.key)))}
            className="shrink-0 rounded-lg border border-slate-200 px-2.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
            aria-label="Remove this line"
          >
            <X size={16} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => {
          setRows((prev) => [...prev, { key: nextKey, value: "" }]);
          setNextKey((k) => k + 1);
        }}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
      >
        <Plus size={15} /> {addLabel}
      </button>
    </div>
  );
}
