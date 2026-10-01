import { Check } from "lucide-react";

export const querySteps = [
  "Choose dataset",
  "Choose variable",
  "Choose query type",
  "Choose spatial region",
  "Choose time settings",
  "Review request"
];

export function QueryStepIndicator({
  steps = querySteps,
  activeStep,
  unlockedStep,
  minimumStep = 0,
  onStepChange
}: {
  steps?: readonly string[];
  activeStep: number;
  unlockedStep: number;
  minimumStep?: number;
  onStepChange: (step: number) => void;
}) {
  return (
    <div className={`grid grid-cols-2 gap-2 sm:grid-cols-3 ${steps.length > 6 ? "lg:grid-cols-5" : "md:grid-cols-6"}`}>
      {steps.map((step, index) => {
        if (index > unlockedStep) return null;

        const isActive = index === activeStep;
        const isComplete = index < activeStep;
        return (
          <button
            key={step}
            type="button"
            disabled={index < minimumStep}
            onClick={() => onStepChange(index)}
            className={`flex min-h-16 min-w-0 items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition disabled:cursor-default ${
              isActive
                ? "border-cyan-400 bg-cyan-50 text-gt-navy"
                : isComplete
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            }`}
          >
            <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${isComplete ? "bg-emerald-600 text-white" : isActive ? "bg-gt-navy text-white" : "bg-slate-100 text-slate-500"}`}>
              {isComplete ? <Check className="h-4 w-4" aria-hidden="true" /> : index + 1}
            </span>
            <span className="min-w-0 break-words leading-5">{step}</span>
          </button>
        );
      })}
    </div>
  );
}
