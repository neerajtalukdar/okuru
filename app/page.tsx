"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    recipient: "",
    relationship: "",
    occasion: "",
    note: "",
    traits: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (data.id) {
      router.push(`/p/${data.id}`);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="mb-14 text-center">
          <p className="text-xs tracking-[0.25em] uppercase mb-5" style={{ color: "var(--muted)" }}>
            送る · Okuru
          </p>
          <h1
            className="text-5xl mb-4 leading-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--fg)" }}
          >
            Make them<br />a playlist.
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted-light)" }}>
            Tell us about the person.<br />We'll build something that feels handpicked.
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-10">
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
          <span className="text-xs tracking-widest uppercase" style={{ color: "var(--muted)" }}>for</span>
          <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Field
            label="Who's it for?"
            hint="Their name"
            value={form.recipient}
            onChange={(v) => setForm({ ...form, recipient: v })}
            required
          />
          <Field
            label="Your relationship"
            hint="e.g. best friend, partner, my sister"
            value={form.relationship}
            onChange={(v) => setForm({ ...form, relationship: v })}
            required
          />
          <Field
            label="What's the occasion?"
            hint="e.g. her birthday, just because, moving to a new city"
            value={form.occasion}
            onChange={(v) => setForm({ ...form, occasion: v })}
            required
          />
          <TextareaField
            label="Describe them"
            hint="Their vibe, what they love, what kind of music they're into, a memory you share..."
            value={form.traits}
            onChange={(v) => setForm({ ...form, traits: v })}
            rows={3}
          />
          <TextareaField
            label="Your note to them"
            hint="What you want them to know when they open this..."
            value={form.note}
            onChange={(v) => setForm({ ...form, note: v })}
            rows={2}
          />

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl text-sm font-medium tracking-widest uppercase transition-all duration-300 disabled:opacity-40"
              style={{
                background: loading ? "var(--surface-2)" : "var(--accent)",
                color: "#0c0a10",
                letterSpacing: "0.15em",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Curating your playlist...
                </span>
              ) : (
                "Build the playlist →"
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  required,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "var(--muted)" }}>
        {label}
      </label>
      <input
        type="text"
        placeholder={hint}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 placeholder-[var(--muted)]"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          color: "var(--fg)",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
      />
    </div>
  );
}

function TextareaField({
  label,
  hint,
  value,
  onChange,
  rows,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  rows: number;
}) {
  return (
    <div>
      <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "var(--muted)" }}>
        {label}
      </label>
      <textarea
        placeholder={hint}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 resize-none placeholder-[var(--muted)]"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          color: "var(--fg)",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
      />
    </div>
  );
}
