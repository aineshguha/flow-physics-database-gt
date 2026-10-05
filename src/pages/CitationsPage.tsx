import { BookMarked, Clock, FileText, GraduationCap } from "lucide-react";

export function CitationsPage() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="inline-flex rounded-full border border-gt-gold/40 bg-cyan-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-gt-navy">
            Citations
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink">Dataset citations and references.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            This page will list the required dataset citations, source papers, DOI links, and acknowledgement text once the final datasets are selected and implemented.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[0.62fr_0.38fr]">
          <div className="gt-panel rounded-lg border p-6">
            <FileText className="h-6 w-6 text-gt-navy" aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">More information coming soon</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              One Emulsions HDF5 file is now connected for remote queries, but its required citation format and supporting papers have not been verified. Citation details will be added after they are confirmed with the dataset owner.
            </p>
          </div>

          <aside className="rounded-lg border border-gt-gold/40 bg-cyan-50 p-6">
            <BookMarked className="h-6 w-6 text-gt-navy" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-semibold text-gt-navy">Planned citation fields</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              <li>Dataset name and version</li>
              <li>Authors or maintaining lab</li>
              <li>Publication or DOI</li>
              <li>Database access date</li>
              <li>Required acknowledgement text</li>
            </ul>
          </aside>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <article className="gt-card rounded-lg border p-5">
            <GraduationCap className="h-5 w-5 text-gt-navy" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold text-ink">For research use</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Future citations should make it clear how students and researchers should cite the database, the simulation dataset, and any supporting numerical method documentation.
            </p>
          </article>
          <article className="gt-card rounded-lg border p-5">
            <Clock className="h-5 w-5 text-gt-navy" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold text-ink">Status</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Citation details are pending verification. Do not infer a DOI or acknowledgement from the HDF5 file name.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
