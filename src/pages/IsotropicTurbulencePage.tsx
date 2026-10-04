import { useEffect, useState } from "react";
import { ArrowRight, Circle, Droplets, Layers3, Check } from "lucide-react";
import { flowConfigurations, getDatasetConfiguration, isFlowCategory, type DatasetSelection } from "../config/isotropicTurbulenceConfig";
import { getDataset } from "../services/datasetService";
import type { DatasetState } from "../services/datasetProvider";
import { DatasetAccessPanel, DatasetBreadcrumbs, DatasetMetadata, DatasetStatus } from "../components/isotropic/DatasetPanels";

const base = "#/datasets/isotropic";
const icons = { bubbles: Circle, droplets: Droplets, emulsions: Layers3 };

function DatasetDetails({ selection }: { selection: DatasetSelection }) {
  const [state, setState] = useState<DatasetState>({ status: "Loading" });
  const configuration = getDatasetConfiguration(selection)!;
  useEffect(() => {
    let active = true;
    setState({ status: "Loading" });
    // Ignore stale provider responses when researchers navigate between selections.
    void getDataset(selection).then(result => { if (active) setState(result); });
    return () => { active = false; };
  }, [selection.category, selection.parameter, selection.value]);
  return <><DatasetStatus state={state} /><div className="mt-8 grid gap-10 lg:grid-cols-2">
    <DatasetMetadata configuration={configuration} selection={selection} /><DatasetAccessPanel state={state} hasVerifiedSchema={Boolean(configuration.verifiedSchemaId)} />
  </div><a href={`#/query/isotropic/${selection.category}/${selection.value}`} className="mt-8 inline-flex items-center gap-2 rounded-md bg-gt-navy px-5 py-3 font-semibold text-white transition hover:bg-[#001B33]">Build Query <ArrowRight size={18} aria-hidden="true" /></a></>;
}

export function IsotropicTurbulencePage({ path }: { path: string }) {
  const [, category, value, extra] = path.split("/");
  const [selected, setSelected] = useState("");
  const validCategory = category && isFlowCategory(category) ? category : null;
  const branch = validCategory ? flowConfigurations[validCategory] : null;
  const validValue = branch && (branch.values as readonly string[]).includes(value);
  const invalid = Boolean(extra !== undefined || (category !== undefined && !validCategory) || (value !== undefined && !validValue));
  const selection: DatasetSelection | null = validCategory && branch && validValue ? { category: validCategory, parameter: branch.parameter, value } : null;
  const breadcrumbs = [
    { label: "Datasets", href: "#/datasets" },
    { label: "Isotropic Turbulence", href: category ? base : undefined },
    ...(branch ? [{ label: branch.label, href: value ? `${base}/${category}` : undefined }] : []),
    ...(selection && branch ? [{ label: `${branch.parameterLabel} ${value}` }] : [])
  ];

  return <section className="py-12"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <DatasetBreadcrumbs items={breadcrumbs} />
    {invalid ? <><h1 className="text-3xl font-semibold text-gt-navy">Configuration unavailable</h1><p className="mt-4 text-slate-600">This selection does not match an available flow configuration.</p><a href={base} className="mt-5 inline-block font-semibold text-gt-navy underline">Choose a configuration</a></> : <>
      <p className="mb-3 text-sm font-semibold text-gt-navy">{branch ? "Isotropic Turbulence" : "Flow configurations"}</p>
      <h1 className="text-3xl font-semibold text-gt-navy sm:text-4xl">{selection && branch ? `Isotropic Turbulence — ${branch.label}` : branch?.label ?? "Isotropic Turbulence"}</h1>
      <p className="mt-3 text-slate-600">{selection && branch ? `${branch.parameterLabel}: ${value}` : branch ? `Select a ${branch.parameterLabel.toLowerCase()} to view dataset details.` : "Select a flow configuration to explore available simulation data."}</p>
      {!branch && <div className="mt-10 grid gap-5 md:grid-cols-3">{Object.entries(flowConfigurations).map(([key, item]) => {
        const Icon = icons[key as keyof typeof icons];
        return <a key={key} href={`${base}/${key}`} className="gt-card rounded-lg border p-7 transition hover:border-gt-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-gt-navy">
          <Icon className="h-9 w-9 text-gt-navy" aria-hidden="true" /><h2 className="mt-6 text-2xl font-semibold text-gt-navy">{item.label}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p><span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-gt-navy">Explore configuration <ArrowRight size={18} aria-hidden="true" /></span>
        </a>;
      })}</div>}
      {branch && !selection && <div className="mt-10 max-w-3xl">
        <fieldset><legend className="text-xl font-semibold text-gt-navy">{branch.parameterLabel}</legend><div className="mt-5 grid grid-cols-3 gap-3">{branch.values.map(option => <label key={option} className={`relative flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 px-3 py-6 text-lg font-semibold transition ${selected === option ? "border-gt-navy bg-gt-navy text-white" : "border-slate-200 bg-white text-gt-navy"}`}>
          <input className="sr-only peer" type="radio" name="parameter" value={option} checked={selected === option} onChange={() => setSelected(option)} />
          <span className="absolute inset-0 rounded-lg peer-focus-visible:ring-4 peer-focus-visible:ring-gt-gold" aria-hidden="true" />{option}{selected === option && <Check size={18} aria-hidden="true" />}
        </label>)}</div></fieldset>
        <section className="my-8 border-y border-slate-200 py-6"><h2 className="text-xl font-semibold text-gt-navy">Dataset Information</h2><p className="mt-3 text-sm leading-6 text-slate-600">Dataset metadata and sample information will appear here once the dataset is connected.</p></section>
        <button disabled={!selected} onClick={() => { window.location.hash = `/datasets/isotropic/${category}/${selected}`; }} className="inline-flex items-center gap-2 rounded-md bg-gt-navy px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Continue to Dataset <ArrowRight size={18} aria-hidden="true" /></button>
      </div>}
      {selection && <DatasetDetails selection={selection} />}
    </>}
  </div></section>;
}
