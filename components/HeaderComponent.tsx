import type { LucideIcon } from "lucide-react";

type HeaderComponentProps = {
  Icon: LucideIcon;
  screenName: string;
  description?: string;
};

export default function HeaderComponent({
  Icon,
  screenName,
  description,
}: HeaderComponentProps) {
  return (
    <header className="flex items-start gap-3 border-b pb-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <h1 className="truncate text-xl font-semibold tracking-tight">
          {screenName}
        </h1>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </header>
  );
}
