import { CheckCircle2, XCircle, Clock } from "lucide-react";

type Status = "verified" | "invalid" | "pending";

export function VerificationBadge({ status }: { status: Status }) {
  if (status === "verified")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--success)]/10 px-2.5 py-1 text-xs font-semibold text-[color:var(--success)]">
        <CheckCircle2 className="h-3.5 w-3.5" /> VERIFIED
      </span>
    );
  if (status === "pending")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--warning)]/10 px-2.5 py-1 text-xs font-semibold text-[color:var(--warning)]">
        <Clock className="h-3.5 w-3.5" /> PENDING
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
      <XCircle className="h-3.5 w-3.5" /> INVALID RECORD
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-[color:var(--success)]/10 text-[color:var(--success)]",
    pending: "bg-[color:var(--warning)]/10 text-[color:var(--warning)]",
    suspended: "bg-destructive/10 text-destructive",
    graduated: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${map[status] ?? "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}
