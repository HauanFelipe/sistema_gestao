import type { ReactNode } from "react";

type Props = {
  title: string;
  value: string | number;
  icon: ReactNode;
};

export default function StatCard({ title, value, icon }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/60 backdrop-blur p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500 dark:text-slate-400">{title}</div>
          <div className="mt-2 text-3xl font-semibold">{value}</div>
        </div>
        <div className="h-12 w-12 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}
