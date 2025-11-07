import React, { useEffect } from 'react'

export default function Modal({ open, onClose, children, title = 'Details' }){
  useEffect(()=>{
    if(!open) return
    const handleKeyDown = (event)=>{
      if(event.key === 'Escape'){
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return ()=>window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if(!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xl px-4 py-10"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="glass-panel relative max-h-[90vh] w-full max-w-5xl overflow-hidden overflow-y-auto"
        onClick={event=>event.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between gap-4 rounded-3xl bg-white/80 px-6 py-4 backdrop-blur-lg dark:bg-slate-900/80">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="ghost-button h-9 px-5 text-sm"
          >
            Close
          </button>
        </div>
        <div className="px-6 pb-6 pt-4">
          {children}
        </div>
      </div>
    </div>
  )
}

