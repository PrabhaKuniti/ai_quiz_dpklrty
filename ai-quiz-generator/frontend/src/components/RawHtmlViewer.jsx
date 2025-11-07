import React, { useState } from 'react'
import { fetchRawHtmlById, fetchRawHtmlByUrl } from '../services/api.js'

export default function RawHtmlViewer({ quizId, url, onClose }){
  const [html, setHtml] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadHtml = async ()=>{
    if(loading) return
    setLoading(true)
    setError('')
    try{
      const data = quizId
        ? await fetchRawHtmlById(quizId)
        : await fetchRawHtmlByUrl(url)
      setHtml(data)
    }catch(err){
      setError(err?.message || 'Failed to load raw HTML')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white">Raw HTML snapshot</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Inspect the exact markup that powered this quiz. Useful for debugging and exporting content.
          </p>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} className="ghost-button">
            Close viewer
          </button>
        )}
      </div>

      {!html && !loading && !error && (
        <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-10 text-center text-sm text-slate-500 shadow-soft dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-300">
          <p className="mb-6">Load the stored HTML payload to review the fetched article.</p>
          <button type="button" onClick={loadHtml} className="brand-button">
            Load raw HTML
          </button>
        </div>
      )}

      {loading && (
        <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-10 text-center shadow-soft dark:border-slate-700/70 dark:bg-slate-900/70">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-brand/20 border-t-brand" />
          <div className="text-sm text-slate-500 dark:text-slate-300">Fetching raw HTML…</div>
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-rose-200/70 bg-rose-50/70 p-6 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
          <div className="flex items-start justify-between gap-4">
            <span>{error}</span>
            <button type="button" onClick={loadHtml} className="ghost-button">
              Retry
            </button>
          </div>
        </div>
      )}

      {html && (
        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 text-sm text-slate-600 shadow-soft dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-300">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">Quiz ID</span>
                <div className="mt-1 font-medium text-slate-700 dark:text-slate-100">{html.quiz_id || '—'}</div>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">URL</span>
                <div className="mt-1 truncate text-slate-500 dark:text-slate-300">{html.url || '—'}</div>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">Title</span>
                <div className="mt-1 font-medium text-slate-700 dark:text-slate-100">{html.title || '—'}</div>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">HTML length</span>
                <div className="mt-1 text-slate-500 dark:text-slate-300">{html.html_length ? html.html_length.toLocaleString() : '—'} characters</div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={()=>{
                if(!html?.raw_html) return
                const blob = new Blob([html.raw_html], { type: 'text/html' })
                const blobUrl = URL.createObjectURL(blob)
                const anchor = document.createElement('a')
                anchor.href = blobUrl
                anchor.download = `raw_html_quiz_${html.quiz_id || 'export'}.html`
                anchor.click()
                URL.revokeObjectURL(blobUrl)
              }}
              className="brand-button"
            >
              Download HTML
            </button>
            <button
              type="button"
              onClick={()=>{
                if(!html?.raw_html) return
                const newWindow = window.open()
                if(!newWindow) return
                newWindow.document.write(html.raw_html)
                newWindow.document.close()
              }}
              className="ghost-button"
            >
              Open in new window
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-slate-950/90 p-4 text-xs text-slate-200 shadow-inner dark:border-slate-700/70">
            <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed">
              {html.raw_html}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}


