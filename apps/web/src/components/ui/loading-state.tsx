import { cn } from "@/lib/utils";

export function LoadingState({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-4", className)}>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-32 animate-pulse rounded-2xl border bg-white/70 p-5">
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="mt-6 h-8 w-20 rounded bg-slate-200" />
          <div className="mt-4 h-3 w-36 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}
