import { ArrowRight, Boxes, Braces, Database, FileCode2 } from "lucide-react";

const workflowSteps = [
  {
    icon: Database,
    title: "Select Dataset",
    description: "Choose a flow physics dataset from the database.",
    label: "Raw Flow Data"
  },
  {
    icon: Boxes,
    title: "Filter & Prepare Data",
    description: "Select the variables, spatial regions, time ranges, and data points needed for a machine learning workflow.",
    label: "Filtered Data"
  },
  {
    icon: Braces,
    title: "ML-Compatible Data",
    description: "Convert the selected scientific data into a structure that can be used by supported machine learning models and frameworks.",
    label: "ML-Compatible Data"
  },
  {
    icon: FileCode2,
    title: "Export Workflow",
    description: "Generate Python-ready output that researchers can use in their machine learning environment.",
    label: "Python / ML Model"
  }
];

export function MLWorkflow() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="inline-flex rounded-full border border-gt-gold/40 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-gt-navy">
            Planned workflow
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">From simulation archive to machine learning workspace.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            This visual flow shows how selected turbulence data will eventually move through filtering, preparation, and export stages.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {workflowSteps.map((step, index) => (
            <div key={step.title} className="relative">
              <article className="gt-card h-full rounded-lg border p-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="grid h-11 w-11 place-items-center rounded-md bg-gt-navy text-gt-gold">
                    <step.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Step {index + 1}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
                <div className="mt-5 rounded-md border border-gt-gold/30 bg-cyan-50 px-3 py-2 text-xs font-semibold text-gt-navy">
                  {step.label}
                </div>
              </article>
              {index < workflowSteps.length - 1 ? (
                <ArrowRight className="mx-auto my-3 h-5 w-5 text-gt-gold lg:absolute lg:-right-3 lg:top-1/2 lg:mx-0 lg:my-0 lg:-translate-y-1/2" aria-hidden="true" />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
