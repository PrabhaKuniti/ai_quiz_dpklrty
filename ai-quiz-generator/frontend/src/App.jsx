import React, { useEffect, useMemo, useState } from 'react'
import GenerateQuizTab from './tabs/GenerateQuizTab.jsx'
import HistoryTab from './tabs/HistoryTab.jsx'

const SunIcon = ({ className = '' }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m16.95 6.95-1.41-1.41M6.46 6.46 5.05 5.05m0 13.9 1.41-1.41m12.02-12.02 1.41-1.41" />
  </svg>
)

const MoonIcon = ({ className = '' }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
  </svg>
)

export default function App(){
  const [activeTab, setActiveTab] = useState('generate')
  const [theme, setTheme] = useState(()=>{
    if(typeof window === 'undefined') return 'light'
    const stored = window.localStorage.getItem('dk-theme')
    if(stored === 'dark' || stored === 'light') return stored
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches
    return prefersDark ? 'dark' : 'light'
  })

  useEffect(()=>{
    if(typeof document === 'undefined') return
    document.body.classList.toggle('dark', theme === 'dark')
    window.localStorage.setItem('dk-theme', theme)
  }, [theme])

  const tabItems = useMemo(()=>[
    { id: 'generate', label: 'Generate Quiz', description: 'Create bespoke quizzes from any Wikipedia article.' },
    { id: 'history', label: 'History', description: 'Review, replay, or export your previously generated quizzes.' },
  ], [])

  const isDark = theme === 'dark'

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="relative min-h-screen overflow-hidden">
        <div className="layout-container">
          <div className="layout-shell" aria-hidden="true" />
          <div className="layout-inner">
            <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-3">
                <span className="badge-soft uppercase tracking-[0.35em] text-xs">AI powered</span>
                <div>
                  <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-900 dark:text-white md:text-5xl">
                    AI Wiki Quiz Generator
                  </h1>
                  <p className="mt-3 max-w-xl text-base text-slate-600 dark:text-slate-300 md:text-lg">
                    Transform any Wikipedia article into a polished, interactive quiz experience. Generate rich questions, take them in-app, and share your learnings instantly.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 md:flex-col md:items-end">
                <button
                  type="button"
                  onClick={()=>setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                  className="ghost-button w-full md:w-auto"
                  aria-label="Toggle light and dark mode"
                >
                  {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                  <span className="hidden text-sm font-medium md:inline">{isDark ? 'Light mode' : 'Dark mode'}</span>
                </button>
              </div>
            </header>

            <main className="page-section">
              <section className="glass-panel">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="max-w-xl space-y-2">
                    <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Quiz Workspace</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Switch between generation and history with instant previews and interactive controls.
                    </p>
                  </div>
                  <div className="w-full md:w-auto">
                    <nav className="pill-tabs" aria-label="Quiz navigation">
                      {tabItems.map(tab => (
                        <button
                          key={tab.id}
                          type="button"
                          className={`pill-tab ${activeTab === tab.id ? 'pill-tab-active' : ''}`}
                          onClick={()=>setActiveTab(tab.id)}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  {tabItems.map(tab => (
                    <div
                      key={`${tab.id}-description`}
                      className={`rounded-2xl border border-transparent/10 bg-slate-100/50 p-5 text-sm text-slate-600 transition dark:bg-slate-800/60 dark:text-slate-300 ${activeTab === tab.id ? 'border-brand/40 shadow-soft dark:border-brand-light/40' : ''}`}
                    >
                      <h3 className="mb-1 font-medium text-slate-800 dark:text-white">{tab.label}</h3>
                      <p>{tab.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                {activeTab === 'generate' ? <GenerateQuizTab /> : <HistoryTab />}
              </section>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

