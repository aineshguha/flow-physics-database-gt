import { BrainCircuit, Braces, Cpu, Database, FileCode2, Layers3, Network, PackageCheck, Rows3, Sparkles, TimerReset } from "lucide-react";
import { Badge } from "../components/Badge";
import { DataPipeline } from "../components/ml/DataPipeline";
import { MLCompatibilityCard } from "../components/ml/MLCompatibilityCard";
import { MLDataPreparationPreview } from "../components/ml/MLDataPreparationPreview";
import { MLModelCard } from "../components/ml/MLModelCard";
import { MLRoadmap } from "../components/ml/MLRoadmap";
import { MLWorkflow } from "../components/ml/MLWorkflow";

const compatibilityCards = [
  {
    icon: Cpu,
    title: "NVIDIA Machine Learning",
    description: "Future versions of this workspace will help prepare flow physics data for workflows using NVIDIA-supported machine learning technologies and models.",
    badge: "Planned"
  },
  {
    icon: FileCode2,
    title: "Python Ready",
    description: "Machine learning workflows will be exportable as Python-compatible data and code.",
    badge: "Planned"
  },
  {
    icon: Database,
    title: "Scientific Dataset Support",
    description: "Maintain important flow physics variables, metadata, coordinates, and time information while preparing data for machine learning.",
    badge: "Planned"
  },
  {
    icon: BrainCircuit,
    title: "Custom Model Development",
    description: "Researchers will be able to use selected flow physics data when developing and training their own machine learning models.",
    badge: "Future Support"
  }
];

const modelCards = [
  {
    icon: Cpu,
    title: "NVIDIA Model",
    description: "Compatibility details coming soon.",
    badge: "Coming Soon"
  },
  {
    icon: Cpu,
    title: "NVIDIA Model",
    description: "Compatibility details coming soon.",
    badge: "Coming Soon"
  },
  {
    icon: BrainCircuit,
    title: "Custom Model",
    description: "Use prepared flow physics datasets with researcher-developed machine learning models.",
    badge: "Future Support"
  }
];

const whyItMatters = [
  {
    icon: Layers3,
    title: "Large Scientific Datasets",
    body: "Flow simulations can contain extremely large amounts of spatial and temporal data. Researchers often only need specific subsets for machine learning experiments."
  },
  {
    icon: PackageCheck,
    title: "ML-Ready Data",
    body: "The platform will help transform selected scientific data into formats that are easier to use in machine learning pipelines."
  },
  {
    icon: TimerReset,
    title: "Faster Experimentation",
    body: "Researchers should eventually be able to move from dataset selection to Python-based machine learning experimentation with fewer manual preprocessing steps."
  }
];

export function MachineLearningPage() {
  return (
    <div className="bg-gt-ivory">
      <section className="relative overflow-hidden border-b border-gt-gold/40 bg-gt-navy text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(179,163,105,0.25),transparent_28rem),linear-gradient(135deg,rgba(0,48,87,1),rgba(0,27,51,1))]" />
        <div className="absolute inset-0 opacity-25">
          <div className="h-full w-full bg-[linear-gradient(90deg,rgba(179,163,105,0.22)_1px,transparent_1px),linear-gradient(0deg,rgba(179,163,105,0.14)_1px,transparent_1px)] bg-[size:56px_56px]" />
        </div>
        <div className="relative mx-auto grid min-h-[520px] max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.58fr_0.42fr] lg:px-8">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="cyan">ML Workspace</Badge>
              <Badge tone="yellow">In Development</Badge>
            </div>
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              Machine Learning Ready Flow Data
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
              Prepare and explore large-scale flow physics datasets for modern machine learning workflows.
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              Flow physics datasets can be filtered, structured, and exported into formats suitable for machine learning applications. This workspace will help researchers connect high-quality scientific datasets with existing machine learning models and frameworks.
            </p>
          </div>

          <article className="rounded-lg border border-gt-gold/35 bg-white/10 p-5 shadow-[0_28px_80px_rgba(0,0,0,0.28)] backdrop-blur">
            <div className="flex items-center gap-3 border-b border-gt-gold/25 pb-4">
              <span className="grid h-11 w-11 place-items-center rounded-md bg-gt-gold text-gt-navy">
                <Network className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-semibold">Planned ML bridge</h2>
                <p className="text-sm text-slate-300">Scientific data to model-ready exports</p>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {[
                { icon: Database, label: "Raw Flow Data" },
                { icon: Rows3, label: "Filtered Data" },
                { icon: Braces, label: "ML-Compatible Data" },
                { icon: FileCode2, label: "Python / ML Model" }
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-md border border-white/10 bg-[#001B33]/78 p-3">
                  <item.icon className="h-5 w-5 text-gt-gold" aria-hidden="true" />
                  <span className="text-sm font-semibold text-cyan-50">{item.label}</span>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <MLWorkflow />

      <section className="border-y border-gt-gold/30 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-gt-gold/40 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-gt-navy">
              Compatibility
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">Machine Learning Compatibility</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              The goal of this workspace is to make flow physics data easier to use with modern machine learning tools and pretrained model ecosystems.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {compatibilityCards.map((card) => (
              <MLCompatibilityCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </section>

      <MLDataPreparationPreview />

      <section className="bg-gt-ivory py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-gt-gold/40 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-gt-navy">
              Model preview
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">Compatible Machine Learning Models</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Supported machine learning models and recommended workflows will appear here as compatibility information becomes available.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {modelCards.map((card, index) => (
              <MLModelCard key={`${card.title}-${index}`} {...card} />
            ))}
          </div>
        </div>
      </section>

      <DataPipeline />

      <section className="bg-gt-ivory pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-gt-gold/40 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-gt-navy">
              Research value
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">Why This Matters</h2>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {whyItMatters.map((item) => (
              <article key={item.title} className="gt-card rounded-lg border p-5 transition hover:-translate-y-1">
                <item.icon className="h-5 w-5 text-gt-navy" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-lg border border-gt-gold/40 bg-cyan-50 p-5">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 text-gt-navy" aria-hidden="true" />
              <p className="text-sm leading-6 text-slate-700">
                This page is informational only. It does not connect to NVIDIA APIs, run preprocessing pipelines, or modify the existing query and export workflow.
              </p>
            </div>
          </div>
        </div>
      </section>

      <MLRoadmap />
    </div>
  );
}
