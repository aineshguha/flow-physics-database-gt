import { QueryBuilder } from "../components/QueryBuilder";
import type { DatasetSelection, FlowCategory } from "../config/isotropicTurbulenceConfig";

export function QueryPage({ selectedDatasetId, isotropicSelection, isotropicDraft, editableSelection }: { selectedDatasetId: string; isotropicSelection?: DatasetSelection; isotropicDraft?: FlowCategory; editableSelection?: boolean }) {
  return <QueryBuilder selectedDatasetId={selectedDatasetId} isotropicSelection={isotropicSelection} isotropicDraft={isotropicDraft} editableSelection={editableSelection} />;
}
