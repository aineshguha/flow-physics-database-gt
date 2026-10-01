import { ReactNode } from "react";

type Tone = "slate" | "green" | "yellow" | "red" | "cyan";

const toneClasses: Record<Tone, string> = {
  slate: "border-gt-gold/30 bg-gt-ivory text-slate-700",
  green: "border-gt-gold/40 bg-cyan-50 text-gt-navy",
  yellow: "border-amber-200 bg-amber-50 text-amber-700",
  red: "border-rose-200 bg-rose-50 text-rose-700",
  cyan: "border-gt-gold/50 bg-cyan-50 text-gt-navy"
};

export function Badge({ children, tone = "slate" }: { children: ReactNode; tone?: Tone }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}
