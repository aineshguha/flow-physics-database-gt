import { useEffect, useMemo, useState } from "react";
import { Header } from "./components/Header";
import { CitationsPage } from "./pages/CitationsPage";
import { ComparePage } from "./pages/ComparePage";
import { DatasetDetailPage } from "./pages/DatasetDetailPage";
import { DatasetsPage } from "./pages/DatasetsPage";
import { DocsPage } from "./pages/DocsPage";
import { HomePage } from "./pages/HomePage";
import { MachineLearningPage } from "./pages/MachineLearningPage";
import { QueryPage } from "./pages/QueryPage";
import { IsotropicTurbulencePage } from "./pages/IsotropicTurbulencePage";
import { getIsotropicDraftFromQueryPath, getIsotropicSelectionFromQueryPath, type DatasetSelection, type FlowCategory } from "./config/isotropicTurbulenceConfig";

type Route =
  | { page: "home" }
  | { page: "datasets" }
  | { page: "dataset-detail"; datasetId: string }
  | { page: "query"; isotropicSelection?: DatasetSelection; isotropicDraft?: FlowCategory; editableSelection?: boolean; invalidSelection?: boolean }
  | { page: "compare" }
  | { page: "machine-learning" }
  | { page: "docs" }
  | { page: "citations" };

function normalizeRoute(hash: string): Route {
  const route = hash.replace(/^#/, "") || "/";

  if (route === "/datasets" || route === "datasets") return { page: "datasets" };
  if (route.startsWith("/datasets/")) return { page: "dataset-detail", datasetId: route.replace("/datasets/", "") };
  if (route.startsWith("/query/isotropic/")) {
    const isotropicSelection = getIsotropicSelectionFromQueryPath(route);
    if (isotropicSelection) return { page: "query", isotropicSelection, editableSelection: route.endsWith("/edit") };
    const isotropicDraft = getIsotropicDraftFromQueryPath(route);
    return isotropicDraft ? { page: "query", isotropicDraft, editableSelection: true } : { page: "query", invalidSelection: true };
  }
  if (route === "/query" || route === "query-builder" || route === "query") return { page: "query" };
  if (route === "/compare" || route === "compare") return { page: "compare" };
  if (route === "/machine-learning" || route === "machine-learning" || route === "ml") return { page: "machine-learning" };
  if (route === "/docs" || route === "docs") return { page: "docs" };
  if (route === "/citations" || route === "citations") return { page: "citations" };

  return { page: "home" };
}

export function App() {
  const [route, setRoute] = useState<Route>(() => normalizeRoute(window.location.hash));
  const [selectedDatasetId, setSelectedDatasetId] = useState("isotropic");

  useEffect(() => {
    function handleHashChange() {
      setRoute(normalizeRoute(window.location.hash));
      window.scrollTo({ top: 0, behavior: "auto" });
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  function handleLearnMore(datasetId: string) {
    window.location.hash = `/datasets/${datasetId}`;
  }

  function handleStartQuery(datasetId: string) {
    setSelectedDatasetId(datasetId);
    window.location.hash = "/query";
  }

  const page = useMemo(() => {
    if (route.page === "datasets") return <DatasetsPage onLearnMore={handleLearnMore} />;
    if (route.page === "dataset-detail" && (route.datasetId === "isotropic" || route.datasetId.startsWith("isotropic/"))) return <IsotropicTurbulencePage key={route.datasetId} path={route.datasetId} />;
    if (route.page === "dataset-detail") return <DatasetDetailPage datasetId={route.datasetId} onStartQuery={handleStartQuery} />;
    if (route.page === "query") return route.invalidSelection
      ? <section className="mx-auto max-w-7xl px-4 py-12"><h1 className="text-3xl font-semibold text-gt-navy">Configuration unavailable</h1><p className="mt-4">This query link does not match an available Isotropic Turbulence configuration.</p><a className="mt-4 inline-block font-semibold text-gt-navy underline" href="#/datasets/isotropic">Choose a configuration</a></section>
      : <QueryPage key={route.isotropicSelection ? `${route.isotropicSelection.category}-${route.isotropicSelection.value}-${route.editableSelection}` : route.isotropicDraft ? `${route.isotropicDraft}-draft` : "generic"} selectedDatasetId={selectedDatasetId} isotropicSelection={route.isotropicSelection} isotropicDraft={route.isotropicDraft} editableSelection={route.editableSelection} />;
    if (route.page === "compare") return <ComparePage />;
    if (route.page === "machine-learning") return <MachineLearningPage />;
    if (route.page === "docs") return <DocsPage />;
    if (route.page === "citations") return <CitationsPage />;
    return <HomePage />;
  }, [route, selectedDatasetId]);

  return (
    <div className="min-h-screen bg-gt-ivory text-slate-900">
      <Header />
      <main>{page}</main>
    </div>
  );
}
