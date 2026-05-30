import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  label: string;
  value: string | number;
  delta?: string;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "accent";
}

const toneStyles: Record<NonNullable<Props["tone"]>, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-[color:var(--success)]/10 text-[color:var(--success)]",
  warning: "bg-[color:var(--warning)]/10 text-[color:var(--warning)]",
  accent: "bg-accent/10 text-accent",
};

export function StatCard({ label, value, delta, icon: Icon, tone = "primary" }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card className="border-border/80">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-muted-foreground">{label}</div>
              <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
              {delta && <div className="mt-1 text-xs text-muted-foreground">{delta}</div>}
            </div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-md ${toneStyles[tone]}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
