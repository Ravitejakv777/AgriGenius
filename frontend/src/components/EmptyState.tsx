import { Leaf } from 'lucide-react';
import { ExampleQueries } from './ExampleQueries';

interface EmptyStateProps {
  onSelectQuery: (query: string) => void;
}

export function EmptyState({ onSelectQuery }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center max-w-xl mx-auto text-center px-4 py-8 select-none">
      {/* Clean Leaf Icon */}
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-white dark:to-neutral-200 flex items-center justify-center shadow-lg shadow-emerald-500/20 dark:shadow-none mb-4">
        <Leaf className="w-7 h-7 text-white dark:text-black" />
      </div>

      {/* Human, Friendly Title */}
      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
        How can I help with your farming today?
      </h2>

      <p className="text-xs sm:text-sm text-slate-500 dark:text-neutral-400 max-w-md leading-relaxed mb-6">
        Ask any question about crops, pest control, irrigation, or fertilizers in English or हिन्दी.
      </p>

      {/* Clean Query Suggestions */}
      <ExampleQueries onSelectQuery={onSelectQuery} />
    </div>
  );
}
