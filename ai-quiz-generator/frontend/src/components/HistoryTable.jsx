import React from 'react'

export default function HistoryTable({ rows, onDetails }){
  if(!rows.length){
    return (
      <div className="rounded-3xl border border-slate-200/70 bg-white/60 p-6 text-center text-sm text-slate-500 dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-300">
        No quizzes have been generated yet. Create your first quiz to build up history.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/70 shadow-soft dark:border-slate-700/70 dark:bg-slate-900/70">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-600 dark:divide-slate-700/60 dark:text-slate-300">
          <thead className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
            <tr>
              <th scope="col" className="px-6 py-4">ID</th>
              <th scope="col" className="px-6 py-4">Title</th>
              <th scope="col" className="px-6 py-4">URL</th>
              <th scope="col" className="px-6 py-4">Generated</th>
              <th scope="col" className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60 dark:divide-slate-700/60">
            {rows.map(row => (
              <tr key={row.id} className="transition hover:bg-brand/5 dark:hover:bg-brand-light/10">
                <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-700 dark:text-slate-200">#{row.id}</td>
                <td className="max-w-[240px] truncate px-6 py-4 font-medium text-slate-800 dark:text-white">{row.title || 'Untitled quiz'}</td>
                <td className="max-w-[320px] truncate px-6 py-4 text-slate-500 dark:text-slate-400">
                  {row.url}
                </td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                  {row.date_generated ? new Date(row.date_generated).toLocaleString() : '—'}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    onClick={()=>onDetails?.(row.id)}
                    className="ghost-button"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

