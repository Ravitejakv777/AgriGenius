import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface ExampleQueriesProps {
  onSelectQuery: (query: string) => void;
}

const QUERIES = [
  "गेहूं की फसल में सिंचाई कब करनी चाहिए?",
  "How do I control pests in mango trees?",
  "धान में तना छेदक (Stem Borer) का नियंत्रण कैसे करें?",
  "What is the seed rate for groundnut crop?"
];

export function ExampleQueries({ onSelectQuery }: ExampleQueriesProps) {
  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {QUERIES.map((query, idx) => (
          <motion.button
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.98 }}
            key={idx}
            type="button"
            onClick={() => onSelectQuery(query)}
            className="flex items-center text-xs text-left bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 p-3 rounded-xl hover:border-emerald-400 dark:hover:border-neutral-600 hover:bg-emerald-50/50 dark:hover:bg-neutral-800/80 transition-all shadow-sm cursor-pointer group"
          >
            <Search className="w-3.5 h-3.5 mr-2 text-emerald-500 dark:text-neutral-400 opacity-60 group-hover:opacity-100 shrink-0" />
            <span className="line-clamp-2 leading-relaxed">{query}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
