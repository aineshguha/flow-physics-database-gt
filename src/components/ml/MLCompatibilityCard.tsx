import { LucideIcon } from "lucide-react";
import { Badge } from "../Badge";

type MLCompatibilityCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  badge: string;
};

export function MLCompatibilityCard({ icon: Icon, title, description, badge }: MLCompatibilityCardProps) {
  return (
    <article className="gt-card rounded-lg border p-5 transition hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-gt-navy text-gt-gold">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <Badge tone={badge === "Future Support" ? "slate" : "cyan"}>{badge}</Badge>
      </div>
      <h3 className="mt-5 text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </article>
  );
}
