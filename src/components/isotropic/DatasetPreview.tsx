import { useState } from "react";
import { ImageOff } from "lucide-react";
import { flowConfigurations, getDatasetPreview, type DatasetSelection } from "../../config/isotropicTurbulenceConfig";

export function DatasetPreview({ selection }: { selection: DatasetSelection }) {
  const preview = getDatasetPreview(selection);
  const branch = flowConfigurations[selection.category];
  const [loadedImage, setLoadedImage] = useState<string | null>(null);
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const unavailable = !preview || failedImage === preview.image;

  return <section aria-labelledby="dataset-preview-heading" className="mt-8 border-y border-gt-gold/40 py-7">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 id="dataset-preview-heading" className="text-xl font-semibold text-gt-navy">Dataset Preview</h2>
      <span className="text-xs font-semibold uppercase text-gt-navy">{preview?.type === "visualization" ? "Scientific Visualization" : "Illustrative Preview"}</span>
    </div>
    <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.8fr)_minmax(220px,0.8fr)] lg:items-end">
      <div className="relative aspect-video overflow-hidden rounded-md border border-slate-200 bg-gt-navy">
        {unavailable ? <div role="img" aria-label="Dataset preview unavailable" className="flex h-full flex-col items-center justify-center gap-3 text-sm text-white/80"><ImageOff size={30} aria-hidden="true" />Preview unavailable</div>
          : <img key={preview.image} src={preview.image} alt={preview.alt} loading="lazy" onLoad={() => setLoadedImage(preview.image)} onError={() => setFailedImage(preview.image)} className={`h-full w-full object-cover transition-opacity duration-150 ${loadedImage === preview.image ? "opacity-100" : "opacity-0"}`} />}
      </div>
      <div className="pb-1">
        <p className="text-xs font-semibold uppercase text-slate-500">Isotropic Turbulence</p>
        <h3 className="mt-2 text-2xl font-semibold text-gt-navy">{branch.label}</h3>
        <p className="mt-2 text-sm text-slate-700">{branch.parameterLabel} <span className="font-semibold">{selection.value}</span></p>
        {preview?.type === "placeholder" && <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">Illustrative artwork only. Not a visualization of this dataset's simulation results.</p>}
      </div>
    </div>
  </section>;
}
