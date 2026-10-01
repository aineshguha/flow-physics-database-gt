import { LucideIcon } from "lucide-react";
import { Badge } from "../Badge";

type MLModelCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  badge: string;
};

export function MLModelCard({ icon: Icon, title, description, badge }: MLModelCardProps) {
  return (
    <article className="rounded-lg border border-gt-gold/30 bg-gt-ivory p-5">
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-white text-gt-navy shadow-sm">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <Badge tone="cyan">{badge}</Badge>
      </div>
      <h3 className="mt-5 text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </article>
  );
}
