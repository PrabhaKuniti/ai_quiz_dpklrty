import React, { useMemo, useState } from 'react'
import TakeQuiz from './TakeQuiz.jsx'
import RawHtmlViewer from './RawHtmlViewer.jsx'
import Modal from './Modal.jsx'

function normalizeError(err){
  const messages = []

  if(typeof err === 'string'){
    const m = err.match(/404[^]*?for url:\s*(\S+)/i)
    if(m){
      messages.push('The page was not found (404).')
      messages.push(`URL: ${m[1]}`)
    } else if(/Failed to fetch|NetworkError|ERR_NETWORK/i.test(err)){
      messages.push('Network error. Please check your connection and try again.')
    } else {
      messages.push(err)
    }
    return { messages }
  }

  if(err && typeof err === 'object'){
    if(typeof err.detail === 'string'){
      const detail = err.detail
      const m = detail.match(/404[^]*?for url:\s*(\S+)/i)
      if(m){
        messages.push('The page was not found (404).')
        messages.push(`URL: ${m[1]}`)
      } else if(/Failed to fetch|NetworkError|ERR_NETWORK/i.test(detail)){
        messages.push('Network error. Please check your connection and try again.')
      } else {
        messages.push(detail)
      }
    } else if(Array.isArray(err.detail)){
      err.detail.forEach(item => {
        if(!item) return
        if(item.type === 'url_scheme'){
          messages.push("Invalid URL scheme. Use 'http' or 'https'.")
          if(item.input){
            messages.push(`Provided: ${item.input}`)
          }
        } else if(item.msg){
          messages.push(item.msg)
        }
      })
    }

    if(messages.length === 0){
      if(err.message){
        messages.push(err.message)
      } else {
        messages.push('Something went wrong while fetching the content.')
      }
    }

    return { messages }
  }

  return { messages: ['Something went wrong while fetching the content.'] }
}

function isValidUrl(url){
  if(!url || typeof url !== 'string') return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function groupQuestionsBySection(questions){
  return questions.reduce((acc, question, index)=>{
    const section = question?.section || 'General'
    if(!acc[section]){
      acc[section] = []
    }
    acc[section].push({ ...question, originalIndex: index })
    return acc
  }, {})
}

export default function QuizDisplay({ data, error, isLoading, sourceUrl, onRetry, quizId }){
  const [mode, setMode] = useState('view')
  const [showRawHtml, setShowRawHtml] = useState(false)

  const groupedQuestions = useMemo(()=>{
    if(!data?.quiz) return {}
    const list = Array.isArray(data.quiz) ? data.quiz : []
    return groupQuestionsBySection(list)
  }, [data])

  if(isLoading){
    return (
      <div className="glass-panel animate-pulse space-y-4">
        <div className="h-5 w-40 rounded-full bg-slate-200/60 dark:bg-slate-700/60" />
        <div className="h-20 w-full rounded-3xl bg-slate-200/50 dark:bg-slate-800/50" />
        <div className="h-14 w-full rounded-3xl bg-slate-200/40 dark:bg-slate-800/40" />
      </div>
    )
  }

  if(error){
    const { messages } = normalizeError(error)
    return (
      <div
        className="glass-panel space-y-4 border border-rose-200/60 bg-rose-50/70 text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200"
        role="alert"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold">Unable to load quiz</h2>
            <p className="text-sm opacity-80">We couldn&apos;t prepare your quiz just yet.</p>
          </div>
          <span className="text-2xl" aria-hidden="true">⚠️</span>
        </div>
        <ul className="space-y-2 pl-5 text-sm">
          {messages.map((message, index)=>(
            <li key={index} className="list-disc">{message}</li>
          ))}
        </ul>
        {sourceUrl && !isValidUrl(sourceUrl) && (
          <p className="rounded-2xl bg-white/40 px-4 py-2 text-xs font-medium text-rose-600 dark:bg-rose-500/20 dark:text-rose-100">
            Provided URL appears invalid: <code className="font-mono">{String(sourceUrl)}</code>
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          {onRetry && (
            <button type="button" onClick={onRetry} className="brand-button">
              Try again
            </button>
          )}
          {sourceUrl && isValidUrl(sourceUrl) && (
            <a href={sourceUrl} target="_blank" rel="noreferrer" className="ghost-button">
              Open source article
            </a>
          )}
        </div>
      </div>
    )
  }

  if(!data){
    return (
      <div className="glass-panel space-y-4 text-center text-slate-500 dark:text-slate-300">
        <h2 className="font-display text-xl font-semibold">No quiz yet</h2>
        <p>Paste a Wikipedia link to craft your first interactive quiz.</p>
        <div className="mx-auto h-2 w-40 rounded-full bg-slate-200/70 dark:bg-slate-700/70" />
      </div>
    )
  }

  const { title, summary, key_entities, sections, quiz, related_topics, cached } = data

  const people = Array.isArray(key_entities?.people) ? key_entities.people : []
  const organizations = Array.isArray(key_entities?.organizations) ? key_entities.organizations : []
  const locations = Array.isArray(key_entities?.locations) ? key_entities.locations : []
  const sectionList = Array.isArray(sections) ? sections : []
  const quizList = Array.isArray(quiz) ? quiz : []
  const relatedList = Array.isArray(related_topics) ? related_topics : []

  return (
    <div className="space-y-6">
      <div className="glass-panel space-y-6">
        {cached && (
          <div className="flex items-center gap-3 rounded-2xl border border-purple-200/70 bg-purple-50/70 p-3 text-sm text-purple-700 dark:border-purple-500/40 dark:bg-purple-500/10 dark:text-purple-200">
            <span role="img" aria-label="bolt">⚡</span>
            <span>This quiz was loaded instantly from cache.</span>
          </div>
        )}

        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <h2 className="font-display text-3xl font-semibold text-slate-900 dark:text-white">{title || 'Untitled quiz'}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">{summary || 'No summary provided for this article.'}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {(sourceUrl || quizId) && (
              <button type="button" onClick={()=>setShowRawHtml(true)} className="ghost-button">
                View raw HTML
              </button>
            )}
            {sourceUrl && (
              isValidUrl(sourceUrl) ? (
                <a className="ghost-button" href={sourceUrl} target="_blank" rel="noreferrer">
                  Open source article
                </a>
              ) : (
                <span className="ghost-button cursor-not-allowed opacity-60">Invalid source URL</span>
              )
            )}
          </div>
        </div>

        <div className="card-grid">
          <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-5 shadow-soft dark:border-slate-700/70 dark:bg-slate-900/70">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
              Entities
            </div>
            <dl className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <div>
                <dt className="badge-soft">People</dt>
                <dd className="mt-2">{people.length ? people.join(', ') : '—'}</dd>
              </div>
              <div>
                <dt className="badge-soft">Organizations</dt>
                <dd className="mt-2">{organizations.length ? organizations.join(', ') : '—'}</dd>
              </div>
              <div>
                <dt className="badge-soft">Locations</dt>
                <dd className="mt-2">{locations.length ? locations.join(', ') : '—'}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-5 shadow-soft dark:border-slate-700/70 dark:bg-slate-900/70">
            <div className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
              Sections
            </div>
            {sectionList.length ? (
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {sectionList.map((sectionName, index)=>(
                  <li
                    key={`${sectionName}-${index}`}
                    className="flex items-center gap-3 rounded-2xl border border-slate-200/60 bg-slate-100/60 px-3 py-2 text-slate-700 dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-200"
                  >
                    <span className="badge-soft">{String(index + 1).padStart(2, '0')}</span>
                    <span>{sectionName}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-2xl bg-slate-100/60 px-4 py-3 text-sm text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                No sections extracted.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="glass-panel space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Interactive quiz</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{quizList.length} questions • Difficulty tagged • Explanations included</p>
          </div>
          {quizList.length > 0 && mode !== 'take' && (
            <button type="button" onClick={()=>setMode('take')} className="brand-button">
              Start interactive mode
            </button>
          )}
        </div>

        {mode === 'take' ? (
          <TakeQuiz quiz={quizList} onComplete={()=>setMode('view')} />
        ) : (
          <div className="space-y-6">
            {Object.keys(groupedQuestions).length ? (
              Object.entries(groupedQuestions).map(([sectionName, questions])=>(
                <section key={sectionName} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                      {sectionName}
                    </h4>
                    <div className="text-xs text-slate-400">
                      {questions.length} question{questions.length > 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="space-y-4">
                    {questions.map(question => {
                      const options = Array.isArray(question?.options) ? question.options : []
                      return (
                        <article
                          key={`${sectionName}-${question.originalIndex}`}
                          className="rounded-3xl border border-slate-200/70 bg-white/70 p-5 shadow-soft dark:border-slate-700/70 dark:bg-slate-900/70"
                        >
                          <header className="flex flex-wrap items-start justify-between gap-3">
                            <div className="text-base font-semibold text-slate-900 dark:text-white">
                              Q{question.originalIndex + 1}. {question?.question || 'Untitled question'}
                            </div>
                            {question?.difficulty && (
                              <span className="badge-soft uppercase tracking-wide text-xs">{question.difficulty}</span>
                            )}
                          </header>
                          <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                            {options.length ? (
                              <ol className="space-y-2 pl-6" type="A">
                                {options.map((option, optionIndex)=>(
                                  <li
                                    key={`${sectionName}-${question.originalIndex}-${optionIndex}`}
                                    className="rounded-xl bg-slate-100/60 px-3 py-2 text-slate-700 dark:bg-slate-800/60 dark:text-slate-200"
                                  >
                                    {option}
                                  </li>
                                ))}
                              </ol>
                            ) : (
                              <div className="rounded-xl bg-slate-100/60 px-4 py-3 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                                No options provided.
                              </div>
                            )}
                            {question?.answer ? (
                              <p className="mt-3 text-sm font-medium text-brand dark:text-brand-light">
                                Answer: {question.answer}
                              </p>
                            ) : (
                              <p className="text-xs text-slate-400">Answer not provided.</p>
                            )}
                            {question?.explanation && (
                              <p className="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-brand dark:bg-brand-light/10 dark:text-brand-light">
                                {question.explanation}
                              </p>
                            )}
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </section>
              ))
            ) : (
              <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-6 text-sm text-slate-500 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-300">
                No quiz questions available.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="glass-panel">
        <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white">Related topics</h3>
        {relatedList.length ? (
          <div className="mt-4 flex flex-wrap gap-3">
            {relatedList.map((topic, index)=>(
              <span key={`${topic}-${index}`} className="badge-soft">{topic}</span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No related topics provided.</p>
        )}
      </div>

      <Modal open={showRawHtml} onClose={()=>setShowRawHtml(false)}>
        <RawHtmlViewer
          quizId={quizId}
          url={sourceUrl}
          onClose={()=>setShowRawHtml(false)}
        />
      </Modal>
    </div>
  )
}

