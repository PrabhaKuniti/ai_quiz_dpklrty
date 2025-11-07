import React, { useEffect, useMemo, useState } from 'react'

const TIME_PER_QUESTION_SECONDS = 45

const letterForIndex = (index)=>String.fromCharCode(65 + index)

function inferCategory(quizList){
  if(!quizList.length) return 'General knowledge'
  const withSection = quizList.find(q => q?.section)
  return withSection?.section || 'General knowledge'
}

export default function TakeQuiz({ quiz, onComplete }){
  const quizList = useMemo(()=> Array.isArray(quiz) ? quiz : [], [quiz])
  const [stage, setStage] = useState('intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [score, setScore] = useState(0)
  const [breakdown, setBreakdown] = useState([])
  const [timeLeft, setTimeLeft] = useState(quizList.length * TIME_PER_QUESTION_SECONDS)
  const [completedAt, setCompletedAt] = useState(null)

  useEffect(()=>{
    setTimeLeft(quizList.length * TIME_PER_QUESTION_SECONDS)
    setStage('intro')
    setCurrentIndex(0)
    setAnswers({})
    setScore(0)
    setBreakdown([])
    setCompletedAt(null)
  }, [quizList.length])

  useEffect(()=>{
    if(stage !== 'active') return
    if(!quizList.length) return
    if(timeLeft <= 0){
      finalizeQuiz()
      return
    }
    const timer = setInterval(()=>{
      setTimeLeft(prev => {
        if(prev <= 1){
          clearInterval(timer)
          finalizeQuiz()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return ()=>clearInterval(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, timeLeft, quizList.length])

  const totalTime = quizList.length * TIME_PER_QUESTION_SECONDS
  const timeProgress = totalTime > 0 ? Math.max(0, Math.min(100, (timeLeft / totalTime) * 100)) : 0
  const questionProgress = quizList.length > 0 ? Math.max(0, Math.min(100, ((currentIndex + (stage === 'result' ? 1 : 0)) / quizList.length) * 100)) : 0
  const category = inferCategory(quizList)

  function formatTime(seconds){
    const safeSeconds = Math.max(0, seconds)
    const mins = Math.floor(safeSeconds / 60).toString().padStart(2, '0')
    const secs = Math.floor(safeSeconds % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }

  function handleStart(){
    setStage('active')
    setTimeLeft(quizList.length * TIME_PER_QUESTION_SECONDS)
    setCurrentIndex(0)
    setAnswers({})
    setScore(0)
    setBreakdown([])
    setCompletedAt(null)
  }

  function handleAnswer(optionLetter){
    setAnswers(prev => ({ ...prev, [currentIndex]: optionLetter }))
  }

  function goToNext(){
    setCurrentIndex(prev => Math.min(prev + 1, quizList.length - 1))
  }

  function goToPrevious(){
    setCurrentIndex(prev => Math.max(prev - 1, 0))
  }

  function finalizeQuiz(){
    const details = quizList.map((question, index)=>{
      const selectedLetter = answers[index]
      const options = Array.isArray(question?.options) ? question.options : []
      const optionIndex = selectedLetter ? selectedLetter.charCodeAt(0) - 65 : -1
      const selectedAnswer = optionIndex >= 0 ? options[optionIndex] : undefined
      const normalizedSelected = selectedAnswer ? selectedAnswer.trim() : ''
      const normalizedCorrect = question?.answer ? question.answer.trim() : ''
      const isCorrect = Boolean(normalizedSelected && normalizedCorrect && normalizedSelected === normalizedCorrect)
      return {
        index,
        question,
        selectedLetter,
        selectedAnswer,
        correctAnswer: question?.answer,
        explanation: question?.explanation,
        isCorrect,
      }
    })

    const correctCount = details.filter(item => item.isCorrect).length
    setScore(correctCount)
    setBreakdown(details)
    setStage('result')
    setCompletedAt(new Date())
  }

  function handleSubmit(){
    finalizeQuiz()
  }

  function handleRetake(){
    setStage('intro')
    setCurrentIndex(0)
    setAnswers({})
    setScore(0)
    setBreakdown([])
    setTimeLeft(quizList.length * TIME_PER_QUESTION_SECONDS)
    setCompletedAt(null)
  }

  if(!quizList.length){
    return (
      <div className="glass-panel text-center text-sm text-slate-500 dark:text-slate-300">
        No quiz questions available yet. Generate a quiz and start again.
      </div>
    )
  }

  const currentQuestion = quizList[currentIndex] || {}
  const options = Array.isArray(currentQuestion?.options) ? currentQuestion.options : []
  const selectedLetter = answers[currentIndex]

  return (
    <div className="space-y-6">
      {stage !== 'intro' && (
        <div className="glass-panel flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="text-xs font-medium uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">{category}</div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <span className="badge-soft text-slate-700 dark:text-slate-200">Question {currentIndex + 1} of {quizList.length}</span>
              <span className="badge-soft text-slate-700 dark:text-slate-200">Answered {Object.keys(answers).length}/{quizList.length}</span>
              <span className="badge-soft text-brand dark:text-brand-light">Time {formatTime(timeLeft)}</span>
            </div>
          </div>
          <div className="w-full max-w-xs">
            <div className="progress-track" aria-hidden="true">
              <div className="progress-bar" style={{ width: `${timeProgress}%` }} />
            </div>
            <div className="mt-1 text-right text-[11px] uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
              Time left
            </div>
          </div>
        </div>
      )}

      {stage === 'intro' && (
        <div className="glass-panel space-y-6 text-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-brand/30 bg-brand/10 px-5 py-2 text-sm font-semibold text-brand dark:border-brand-light/40 dark:bg-brand-light/10 dark:text-brand-light">
            Ready to quiz?
          </div>
          <div className="space-y-3">
            <h2 className="font-display text-3xl font-semibold text-slate-900 dark:text-white">{category} quiz</h2>
            <p className="mx-auto max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              {quizList.length} carefully crafted questions with explanations and difficulty markers. Track your progress, beat the timer, and review a detailed breakdown afterwards.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="badge-soft">{quizList.length} questions</span>
            <span className="badge-soft">Approx. {Math.ceil(totalTime / 60)} min</span>
            <span className="badge-soft">Multiple choice</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <button type="button" onClick={handleStart} className="brand-button">
              Start quiz
            </button>
            {onComplete && (
              <button type="button" onClick={onComplete} className="ghost-button">
                Back
              </button>
            )}
          </div>
        </div>
      )}

      {stage === 'active' && (
        <div className="glass-panel space-y-6">
          <div className="flex flex-col gap-3">
            <div className="text-sm font-semibold text-brand dark:text-brand-light">
              Q{currentIndex + 1}
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              {currentQuestion?.question || 'Untitled question'}
            </h3>
            {currentQuestion?.difficulty && (
              <span className="badge-soft w-fit uppercase tracking-wide text-xs">
                {currentQuestion.difficulty}
              </span>
            )}
            {currentQuestion?.section && (
              <span className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                {currentQuestion.section}
              </span>
            )}
          </div>

          <div className="space-y-3">
            {options.map((option, index)=>{
              const optionLetter = letterForIndex(index)
              const isSelected = selectedLetter === optionLetter
              return (
                <label
                  key={`${currentIndex}-${optionLetter}`}
                  className={`option-card group ${isSelected ? 'option-card-selected' : ''}`}
                >
                  <input
                    type="radio"
                    name={`question-${currentIndex}`}
                    value={optionLetter}
                    checked={isSelected}
                    onChange={()=>handleAnswer(optionLetter)}
                    className="sr-only"
                  />
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/70 bg-white/80 text-base font-semibold text-slate-500 transition group-hover:border-brand group-hover:text-brand dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-300">
                    {optionLetter}
                  </div>
                  <div className="flex-1 text-sm text-slate-700 transition group-hover:text-slate-900 dark:text-slate-200 dark:group-hover:text-white">
                    {option}
                  </div>
                </label>
              )
            })}
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="w-full md:w-1/2">
              <div className="progress-track" aria-hidden="true">
                <div className="progress-bar" style={{ width: `${questionProgress}%` }} />
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                Quiz progress
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={goToPrevious} disabled={currentIndex === 0} className="ghost-button disabled:opacity-40">
                Previous
              </button>
              {currentIndex < quizList.length - 1 ? (
                <button type="button" onClick={goToNext} className="ghost-button">
                  Next
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} className="brand-button">
                  Submit quiz
                </button>
              )}
              {onComplete && (
                <button type="button" onClick={onComplete} className="ghost-button">
                  Exit
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {stage === 'result' && (
        <div className="glass-panel space-y-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-emerald-200/60 bg-emerald-50/70 px-5 py-2 text-sm font-semibold text-emerald-600 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200">
              Quiz complete
            </div>
            <h2 className="font-display text-3xl font-semibold text-slate-900 dark:text-white">You scored {score} / {quizList.length}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Accuracy {(quizList.length ? Math.round((score / quizList.length) * 100) : 0)}% • Completed {completedAt ? completedAt.toLocaleTimeString() : ''}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-5 text-center shadow-soft dark:border-slate-700/70 dark:bg-slate-900/70">
              <div className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                Correct
              </div>
              <div className="mt-2 text-3xl font-semibold text-emerald-500 dark:text-emerald-300">{score}</div>
            </div>
            <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-5 text-center shadow-soft dark:border-slate-700/70 dark:bg-slate-900/70">
              <div className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                Incorrect
              </div>
              <div className="mt-2 text-3xl font-semibold text-rose-500 dark:text-rose-300">{breakdown.filter(item => item.selectedLetter && !item.isCorrect).length}</div>
            </div>
            <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-5 text-center shadow-soft dark:border-slate-700/70 dark:bg-slate-900/70">
              <div className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
                Unanswered
              </div>
              <div className="mt-2 text-3xl font-semibold text-slate-500 dark:text-slate-300">{quizList.length - breakdown.filter(item => item.selectedLetter).length}</div>
            </div>
          </div>

          <div className="space-y-4">
            {breakdown.map(item => {
              const { question } = item
              return (
                <div
                  key={item.index}
                  className={`rounded-3xl border p-5 shadow-soft transition ${item.isCorrect ? 'border-emerald-200/70 bg-emerald-50/70 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-100' : 'border-rose-200/70 bg-rose-50/70 text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-100'}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="font-semibold">
                      Q{item.index + 1}. {question?.question || 'Untitled question'}
                    </div>
                    <span className="badge-soft uppercase tracking-wide text-xs">
                      {item.isCorrect ? 'Correct' : 'Review'}
                    </span>
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Your answer: </span>
                      {item.selectedLetter ? `${item.selectedLetter}. ${item.selectedAnswer || '—'}` : 'Not answered'}
                    </div>
                    {!item.isCorrect && (
                      <div>
                        <span className="font-medium">Correct answer: </span>
                        {item.correctAnswer || 'Not provided'}
                      </div>
                    )}
                    {item.explanation && (
                      <div className="rounded-2xl bg-white/60 px-4 py-3 text-sm text-slate-600 dark:bg-slate-900/60 dark:text-slate-300">
                        {item.explanation}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex flex-wrap gap-4">
            <button type="button" onClick={handleRetake} className="brand-button">
              Retake quiz
            </button>
            <button type="button" onClick={handleStart} className="ghost-button">
              Start fresh
            </button>
            {onComplete && (
              <button type="button" onClick={onComplete} className="ghost-button">
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}



