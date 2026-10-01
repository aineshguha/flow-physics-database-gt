import { ArrowDown, BrainCircuit, Database, FileCode2, Filter, PackageCheck, Rows3 } from "lucide-react";

const pipelineNodes = [
  { icon: Database, label: "Raw Simulation Data" },
  { icon: Filter, label: "Dataset Filtering" },
  { icon: Rows3, label: "ML Data Preparation" },
  { icon: PackageCheck, label: "Model-Compatible Dataset" },
  { icon: FileCode2, label: "Python Export" },
  { icon: BrainCircuit, label: "Machine Learning Model" }
];

export function DataPipeline() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <article className="gt-panel rounded-lg border p-6">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-gt-gold/40 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-gt-navy">
              Data pipeline
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">Planned machine learning data workflow.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This represents the planned machine learning data workflow.
            </p>
          </div>

          <div className="mt-8 grid gap-3 lg:grid-cols-6">
            {pipelineNodes.map((node, index) => (
              <div key={node.label} className="relative">
                <div className="flex h-full flex-col items-center justify-center rounded-lg border border-gt-gold/30 bg-white p-4 text-center shadow-sm">
                  <span className="grid h-11 w-11 place-items-center rounded-md bg-gt-navy text-gt-gold">
                    <node.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="mt-3 text-sm font-semibold leading-5 text-slate-700">{node.label}</span>
                </div>
                {index < pipelineNodes.length - 1 ? (
                  <ArrowDown className="mx-auto my-2 h-5 w-5 text-gt-gold lg:absolute lg:-right-4 lg:top-1/2 lg:mx-0 lg:my-0 lg:-translate-y-1/2 lg:-rotate-90" aria-hidden="true" />
                ) : null}
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
