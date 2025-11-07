import React, { useEffect, useState } from 'react'
import { fetchHistory, fetchQuizById } from '../services/api.js'
import HistoryTable from '../components/HistoryTable.jsx'
import Modal from '../components/Modal.jsx'
import QuizDisplay from '../components/QuizDisplay.jsx'

export default function HistoryTab(){
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(null)

  useEffect(()=>{
    (async ()=>{
      try{
        const list = await fetchHistory()
        setRows(Array.isArray(list) ? list : [])
        setError('')
      }catch(err){
        setError(err?.message || 'Failed to load history')
      }finally{
        setLoading(false)
      }
    })()
  }, [])

  async function viewDetails(id){
    try{
      const data = await fetchQuizById(id)
      setActive({ ...data, _quizId: id })
      setError('')
      setOpen(true)
    }catch(err){
      setError(err?.message || 'Failed to load quiz')
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass-panel space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">Quiz history</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Revisit generated quizzes, reopen interactive sessions, or export their raw content.
            </p>
          </div>
          <div className="rounded-full border border-slate-200/70 bg-slate-100/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 dark:border-slate-700/70 dark:bg-slate-800/70 dark:text-slate-300">
            {rows.length} saved
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-6 text-sm text-slate-500 shadow-soft dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-300">
            Loading history…
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200/70 bg-rose-50/70 p-6 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        ) : (
          <HistoryTable rows={rows} onDetails={viewDetails} />
        )}
      </div>

      <Modal open={open} onClose={()=>setOpen(false)} title="Quiz details">
        <QuizDisplay data={active} quizId={active?._quizId} />
      </Modal>
    </div>
  )
}

