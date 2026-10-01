import { CheckCircle2 } from "lucide-react";
import { Badge } from "../Badge";

const roadmapItems = [
  "Dataset filtering integration",
  "ML-compatible data preparation",
  "NVIDIA model compatibility",
  "Python workflow generation",
  "Model-specific dataset recommendations",
  "ML data previews",
  "Custom machine learning workflows"
];

export function MLRoadmap() {
  return (
    <section className="border-t border-gt-gold/30 bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="inline-flex rounded-full border border-gt-gold/40 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-gt-navy">
            Future features
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">Coming to the ML Workspace</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            These items are placeholders for future implementation once model compatibility and filtered-data requirements are defined.
          </p>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {roadmapItems.map((item) => (
            <div key={item} className="flex items-center justify-between gap-4 rounded-lg border border-gt-gold/30 bg-gt-ivory p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-gt-navy" aria-hidden="true" />
                <span className="text-sm font-semibold text-slate-700">{item}</span>
              </div>
              <Badge tone="slate">Planned</Badge>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
