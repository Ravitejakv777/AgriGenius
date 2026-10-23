import { useState } from 'react';
import { ArrowLeft, BarChart3, CircleHelp, Play, ShieldAlert, Timer } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { compareModels } from '../lib/api';
import type { ModelComparison, ModelComparisonResult } from '../lib/types';
import { ThemeToggle } from '../components/ThemeToggle';

const exampleQueries = [
  { language: 'Hindi', query: 'गेहूं की फसल में सिंचाई कब करनी चाहिए?' },
  { language: 'Telugu', query: 'వరి పంటలో ఆకు ముడత తెగులు నివారణ ఎలా చేయాలి?' },
  { language: 'English', query: 'How do I control pests in mango trees?' },
];

function Metric({ label, value, lowerIsBetter = false }: { label: string; value?: number | null; lowerIsBetter?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-neutral-800 p-3">
      <div className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-neutral-400">{label}</div>
      <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
        {value === undefined || value === null ? 'Pending' : value.toFixed(3)}
      </div>
      {value !== undefined && value !== null && <div className="text-[9px] text-slate-400">{lowerIsBetter ? 'Lower is better' : 'Higher is better'}</div>}
    </div>
  );
}

function ModelCard({ model }: { model: ModelComparisonResult }) {
  return (
    <section className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">{model.provider}</div>
          <h3 className="mt-1 break-all text-sm font-bold text-slate-900 dark:text-white">{model.model}</h3>
        </div>
        <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${model.status === 'ok' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'}`}>
          {model.status === 'ok' ? 'Completed' : 'Unavailable'}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 dark:border-neutral-800 p-3">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-slate-500"><Timer className="h-3 w-3" /> Generation</div>
          <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{model.status === 'ok' ? `${model.generation_latency_ms.toLocaleString()} ms` : '—'}</div>
          <div className="text-[9px] text-slate-400">End-to-end call time</div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-neutral-800 p-3">
          <div className="text-[10px] uppercase tracking-wide text-slate-500">Answer size</div>
          <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{model.answer_characters?.toLocaleString() ?? '—'}</div>
          <div className="text-[9px] text-slate-400">Characters</div>
        </div>
        <Metric label="Faithfulness" value={model.metrics?.faithfulness} />
        <Metric label="Answer relevance" value={model.metrics?.answer_relevancy} />
      </div>
      {model.status === 'ok' ? (
        <div className="mt-4 rounded-xl bg-slate-50 dark:bg-neutral-950 p-3 text-sm leading-relaxed text-slate-700 dark:text-neutral-200 whitespace-pre-wrap">{model.answer}</div>
      ) : (
        <p className="mt-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-800 dark:text-rose-200">{model.error}</p>
      )}
      {model.metrics?.unsupported_claim_rate_proxy !== undefined && model.metrics.unsupported_claim_rate_proxy !== null && <div className="mt-3 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200"><ShieldAlert className="h-4 w-4 shrink-0" /> Unsupported-claim rate proxy: {(model.metrics.unsupported_claim_rate_proxy * 100).toFixed(1)}%</div>}
      {model.evaluation_error && <p className="mt-3 text-xs text-amber-800 dark:text-amber-200">RAGAS scoring unavailable: {model.evaluation_error}</p>}
    </section>
  );
}

export function EvaluationPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState(exampleQueries[0].query);
  const [result, setResult] = useState<ModelComparison | null>(null);
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);

  const runComparison = async () => {
    if (!query.trim()) return;
    setRunning(true);
    setError('');
    setResult(null);
    try {
      setResult(await compareModels(query.trim()));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'The comparison request failed.');
    } finally {
      setRunning(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white pb-28">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 dark:border-neutral-800 bg-white/90 dark:bg-black/90 px-4 py-3 backdrop-blur">
        <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-sm font-semibold"><ArrowLeft className="h-4 w-4" /> AgriGenius</button>
        <ThemeToggle />
      </header>
      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-8 sm:py-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-200"><BarChart3 className="h-3.5 w-3.5" /> Live two-model comparison</div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">LLM testing and quality</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-neutral-400">Gemini and Groq receive the same retrieved KCC passages. This page measures generation latency and runs RAGAS faithfulness and answer relevance with one shared Gemini judge.</p>
        </div>

        <section className="mt-7 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm sm:p-6">
          <label htmlFor="eval-query" className="text-sm font-bold">Question to evaluate</label>
          <textarea id="eval-query" value={query} onChange={(event) => setQuery(event.target.value)} rows={3} className="mt-2 w-full resize-y rounded-xl border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />
          <div className="mt-2 flex flex-wrap gap-2">
            {exampleQueries.map((example) => (
              <button key={example.language} type="button" onClick={() => setQuery(example.query)} className="rounded-full border border-slate-200 dark:border-neutral-700 px-3 py-1.5 text-[10px] font-semibold text-slate-600 dark:text-neutral-300 hover:border-emerald-500">{example.language} example</button>
            ))}
          </div>
          <button type="button" disabled={running || !query.trim()} onClick={runComparison} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white disabled:cursor-wait disabled:opacity-60">
            <Play className="h-3.5 w-3.5" /> {running ? 'Running both models and RAGAS judge…' : 'Run dual-model evaluation'}
          </button>
          {error && <p className="mt-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-800 dark:text-rose-200">{error}</p>}
        </section>

        {result && <>
          <div className="mt-6 rounded-xl border border-sky-200 dark:border-neutral-800 bg-sky-50 dark:bg-neutral-900 p-4 text-xs leading-relaxed text-sky-900 dark:text-neutral-200">
            <div className="flex items-center gap-2 font-bold"><CircleHelp className="h-4 w-4" /> Test run details</div>
            <p className="mt-1">Retrieved passages: {result.source_count}. RAGAS status: {result.evaluation.status}. Judge: {result.evaluation.judge_model}. {result.evaluation.hallucination_measure}</p>
            {result.evaluation.status === 'error' && <p className="mt-1">The model outputs and timings are still shown; score fields stay pending because the judge did not complete.</p>}
            {result.evaluation.status === 'skipped_no_context' && <p className="mt-1">No passages were retrieved, so context-based quality scores were skipped.</p>}
            {result.evaluation.status === 'skipped_no_successful_generation' && <p className="mt-1">Neither model returned an answer, so RAGAS scoring was skipped.</p>}
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {result.models.map((model) => <ModelCard key={model.provider} model={model} />)}
          </div>
          <section className="mt-5 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5">
            <h2 className="text-sm font-bold">Shared retrieved evidence ({result.sources.length})</h2>
            <div className="mt-3 space-y-3">
              {result.sources.map((source) => (
                <article key={source.rank} className="rounded-xl bg-slate-50 dark:bg-neutral-950 p-3">
                  <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">Source {source.rank} · {source.metadata.Crop || 'Crop unspecified'} · {source.metadata.QueryType || 'Category unspecified'}</div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-neutral-300">{source.text}</p>
                </article>
              ))}
            </div>
          </section>
        </>}

        <section className="mt-8 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-6">
          <h2 className="text-lg font-bold">How to read these scores</h2>
          <dl className="mt-4 grid gap-4 text-xs leading-relaxed sm:grid-cols-3">
            <div><dt className="font-bold">Faithfulness</dt><dd className="mt-1 text-slate-600 dark:text-neutral-400">RAGAS estimates the fraction of answer claims supported by retrieved passages. Higher is better.</dd></div>
            <div><dt className="font-bold">Answer relevance</dt><dd className="mt-1 text-slate-600 dark:text-neutral-400">RAGAS estimates whether the response addresses the question. It does not independently validate agronomic correctness.</dd></div>
            <div><dt className="font-bold">Unsupported-claim proxy</dt><dd className="mt-1 text-slate-600 dark:text-neutral-400">Computed as 1 − faithfulness. It is a proxy, not a separate hallucination classifier or human safety review.</dd></div>
          </dl>
          <p className="mt-4 border-t border-slate-100 dark:border-neutral-800 pt-3 text-[10px] text-slate-500 dark:text-neutral-400">Scores are per prompt and model. Repeat across reviewed Hindi, Telugu, and English test cases before reporting aggregate results. The shared judge can have model and language bias; retain manual agronomist review for safety-sensitive advice.</p>
        </section>
      </main>
    </motion.div>
  );
}
