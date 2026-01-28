import { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function EmptyState({ title, description, action }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-900 bg-white/70 dark:bg-slate-950/60 backdrop-blur p-8 text-center">
      <div className="text-lg font-semibold">{title}</div>
      {description && <div className="mt-2 text-sm text-gray-500 dark:text-slate-400">{description}</div>}
      {action && <div className="mt-4 flex items-center justify-center">{action}</div>}
    </div>
  );
}
