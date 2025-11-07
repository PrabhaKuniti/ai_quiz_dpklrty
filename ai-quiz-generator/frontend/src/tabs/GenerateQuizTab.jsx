import React, { useEffect, useRef, useState } from 'react'
import { generateQuiz, previewUrl } from '../services/api.js'
import QuizDisplay from '../components/QuizDisplay.jsx'

function isValidWikipediaUrl(url){
  try{
    const u = new URL(url)
    return /wikipedia\.org$/.test(u.hostname)
  }catch{ return false }
}

export default function GenerateQuizTab(){
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [preview, setPreview] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const previewTimeoutRef = useRef(null)

  // Preview URL when user types
  useEffect(()=>{
    if(previewTimeoutRef.current){
      clearTimeout(previewTimeoutRef.current)
    }
    
    if(!url || !isValidWikipediaUrl(url)){
      setPreview(null)
      return
    }
    
    setPreviewLoading(true)
    previewTimeoutRef.current = setTimeout(async ()=>{
      try{
        const result = await previewUrl(url)
        if(result.valid){
          setPreview(result.title)
        } else {
          setPreview(null)
        }
      }catch{
        setPreview(null)
      }finally{
        setPreviewLoading(false)
      }
    }, 500) // Debounce 500ms
    
    return ()=>{
      if(previewTimeoutRef.current){
        clearTimeout(previewTimeoutRef.current)
      }
    }
  }, [url])

  async function onSubmit(e){
    e.preventDefault()
    setError('')
    setData(null)
    if(!isValidWikipediaUrl(url)){
      setError('Please enter a valid wikipedia.org URL')
      return
    }
    setLoading(true)
    try{
      const result = await generateQuiz(url)
      setData(result)
    }catch(err){
      setError(err || 'Failed to generate quiz')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass-panel">
        <div className="flex flex-col gap-6 lg:flex-row">
          <form onSubmit={onSubmit} className="flex-1 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Wikipedia Source URL</label>
              <div className="relative flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/80 p-3 pr-4 transition hover:border-brand hover:shadow-soft dark:border-slate-700/70 dark:bg-slate-900/60">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 text-brand dark:bg-brand-light/20">
                  <span className="font-display text-lg">W</span>
                </div>
                <input
                  className="w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                  placeholder="https://en.wikipedia.org/wiki/Artificial_intelligence"
                  value={url}
                  onChange={e=>{
                    setUrl(e.target.value)
                    setHasInteracted(true)
                  }}
                  aria-label="Wikipedia article URL"
                />
                {url && (
                  <button
                    type="button"
                    onClick={()=>setUrl('')}
                    className="ghost-button h-9 w-9 rounded-full border-0 bg-transparent p-0 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-200"
                    aria-label="Clear URL"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Paste a Wikipedia article link to generate a complete quiz with sections, difficulty, and explanations.
              </div>
              <button type="submit" disabled={loading || !url} className="brand-button disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? (
                  <>
                    <span className="flex h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
                    Generating…
                  </>
                ) : (
                  'Generate Quiz'
                )}
              </button>
        </div>

            <div className="space-y-3 text-sm">
        {previewLoading && (
                <div className="flex items-center gap-3 rounded-2xl border border-brand/30 bg-brand/10 p-4 text-brand dark:border-brand-light/40 dark:bg-brand-light/10">
                  <span className="h-3 w-3 animate-ping rounded-full bg-brand/80" aria-hidden="true" />
                  <span>Scanning article metadata…</span>
                </div>
        )}

        {preview && !previewLoading && (
                <div className="flex flex-col gap-2 rounded-2xl border border-emerald-200/60 bg-emerald-50/60 p-4 text-emerald-600 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200">
                  <span className="text-xs font-semibold uppercase tracking-wide">Article preview</span>
                  <span className="text-base font-medium text-emerald-700 dark:text-emerald-100">{preview}</span>
          </div>
        )}

        {Boolean(error) && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-700 dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-200">
            {(()=>{
              let message = ''
              if(error && typeof error === 'object' && error.message){
                message = error.message
              } else if(typeof error === 'string'){
                try{
                  const j = JSON.parse(error)
                  const detail = j?.detail
                  if(Array.isArray(detail)){
                    const urlSchemeError = detail.find(d => d?.type === 'url_scheme')
                    if(urlSchemeError){
                      message = "Please enter a valid website link that starts with http:// or https://."
                    }
                  } else if(typeof detail === 'string'){
                    if(/404|Not Found|doesn't exist/i.test(detail)){
                            message = "We couldn't find that page. Double-check the link and try again."
                    } else {
                      message = detail
                    }
                  }
                }catch{
                  if(/404|Not Found|doesn't exist/i.test(error)){
                          message = "We couldn't find that page. Double-check the link and try again."
                  } else {
                    message = error
                  }
                }
              } else {
                message = 'Something went wrong. Please try again.'
              }
                    return message
            })()}
          </div>
        )}

              {loading && (
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-4 text-sm text-slate-600 shadow-inner dark:border-slate-700/60 dark:bg-slate-900/50 dark:text-slate-300">
                  <svg className="h-4 w-4 animate-spin text-brand" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  <span>Scraping article, summarising sections, and crafting question set…</span>
                </div>
              )}

              {!loading && !error && !preview && hasInteracted && !isValidWikipediaUrl(url) && url && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-700 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-200">
                  Wikipedia URLs usually look like <code className="rounded bg-slate-200/60 px-2 py-1 text-xs dark:bg-slate-700/70">https://en.wikipedia.org/wiki/Your_Topic</code>
                </div>
              )}

        {data?.cached && (
                <div className="flex items-center gap-3 rounded-2xl border border-purple-200/70 bg-purple-50/70 p-4 text-sm text-purple-700 dark:border-purple-500/40 dark:bg-purple-500/10 dark:text-purple-200">
                  <span role="img" aria-label="bolt" className="text-lg">⚡</span>
            <div>
                    <strong>Instant load.</strong> This quiz was generated earlier and retrieved from cache to keep things fast.
                  </div>
              </div>
              )}
            </div>
          </form>

        </div>
      </div>

      {data && (
        <div className="space-y-6">
          <QuizDisplay data={data} sourceUrl={url} />
          </div>
        )}
    </div>
  )
}


