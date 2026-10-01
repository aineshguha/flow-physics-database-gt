import { Lock, SlidersHorizontal } from "lucide-react";
import { datasets } from "../../data/datasets";
import { Badge } from "../Badge";

const inputVariables = ["Velocity", "Pressure", "Vorticity", "Temperature", "Other Variables"];

export function MLDataPreparationPreview() {
  return (
    <section className="border-y border-gt-gold/30 bg-white py-16">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.42fr_0.58fr] lg:px-8">
        <div>
          <div className="inline-flex rounded-full border border-gt-gold/40 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-gt-navy">
            Preview interface
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink">Prepare Data for Machine Learning</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            This disabled panel shows the planned shape of an ML dataset preparation workspace. It does not process data yet.
          </p>
        </div>

        <article className="gt-panel rounded-lg border p-6">
          <div className="flex items-start justify-between gap-4 border-b border-gt-gold/30 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-gt-navy" aria-hidden="true" />
                <h3 className="text-xl font-semibold text-ink">ML dataset preparation</h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">Future controls for creating model-ready subsets from flow physics data.</p>
            </div>
            <Badge tone="yellow">Preview</Badge>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700">
              Dataset
              <select disabled className="mt-2 w-full rounded-md border border-gt-gold/30 bg-slate-100 px-3 py-2 text-sm text-slate-500">
                <option>Select dataset</option>
                {datasets.map((dataset) => (
                  <option key={dataset.id}>{dataset.name}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Spatial Region
              <input disabled placeholder="Select region" className="mt-2 w-full rounded-md border border-gt-gold/30 bg-slate-100 px-3 py-2 text-sm text-slate-500" />
            </label>

            <fieldset className="rounded-lg border border-gt-gold/30 bg-gt-ivory p-4 md:col-span-2">
              <legend className="px-1 text-sm font-semibold text-slate-700">Input Variables</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {inputVariables.map((variable) => (
                  <label key={variable} className="flex items-center gap-2 text-sm text-slate-500">
                    <input disabled type="checkbox" className="accent-gt-gold" />
                    {variable}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="block text-sm font-semibold text-slate-700">
              Time Range
              <input disabled placeholder="Select time range" className="mt-2 w-full rounded-md border border-gt-gold/30 bg-slate-100 px-3 py-2 text-sm text-slate-500" />
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Output Format
              <select disabled className="mt-2 w-full rounded-md border border-gt-gold/30 bg-slate-100 px-3 py-2 text-sm text-slate-500">
                <option>Python</option>
                <option>NumPy</option>
                <option>Tensor</option>
                <option>Other</option>
              </select>
            </label>
          </div>

          <button disabled className="mt-6 inline-flex cursor-not-allowed items-center gap-2 rounded-md bg-slate-300 px-5 py-3 text-sm font-bold text-slate-600">
            <Lock className="h-4 w-4" aria-hidden="true" />
            Prepare ML Dataset
          </button>
          <p className="mt-3 text-sm font-medium text-slate-500">Data preparation functionality coming soon.</p>
        </article>
      </div>
    </section>
  );
}
