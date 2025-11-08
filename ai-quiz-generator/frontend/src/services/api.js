const BASE_URL = import.meta?.env?.VITE_API_URL || 'http://localhost:8000'

export async function previewUrl(url){
  const res = await fetch(`${BASE_URL}/preview_url`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ url })
  })
  if(!res.ok){
    return { title: '', valid: false }
  }
  return await res.json()
}

export async function generateQuiz(url){
  const res = await fetch(`${BASE_URL}/generate_quiz`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ url })
  })
  if(!res.ok){
    const text = await res.text()
    let message = 'Failed to generate quiz'
    let errorType = 'unknown'
    
    try{
      const json = JSON.parse(text)
      const detail = json?.detail
      
      // Check for URL scheme errors
      if(Array.isArray(detail)){
        const urlSchemeError = detail.find(d => d?.type === 'url_scheme')
        if(urlSchemeError){
          message = "Please enter a valid website link that starts with http:// or https://."
          errorType = 'url_scheme'
        }
      } else if(typeof detail === 'string'){
        // Check for 404 errors
        if(/404|Not Found|doesn't exist/i.test(detail)){
          message = "Oops! Looks like the page doesn't exist. Please double-check the link before trying again."
          errorType = 'not_found'
        } else {
          message = detail
        }
      }
    }catch{
      // If text is not JSON, check if it contains 404
      if(text && /404|Not Found|doesn't exist/i.test(text)){
        message = "Oops! Looks like the page doesn't exist. Please double-check the link before trying again."
        errorType = 'not_found'
      } else if(text){
        message = text
      }
    }
    
    const err = new Error(message)
    err.errorType = errorType
    throw err
  }
  return await res.json()
}

export async function fetchHistory(){
  const res = await fetch(`${BASE_URL}/history`)
  if(!res.ok) throw new Error('Failed to load history')
  return await res.json()
}

export async function fetchQuizById(id){
  const res = await fetch(`${BASE_URL}/quiz/${id}`)
  if(!res.ok) throw new Error('Failed to load quiz')
  return await res.json()
}

export async function fetchRawHtmlById(id){
  const res = await fetch(`${BASE_URL}/quiz/${id}/raw_html`)
  if(!res.ok){
    if(res.status === 404){
      throw new Error('Raw HTML not available for this quiz')
    }
    throw new Error('Failed to load raw HTML')
  }
  return await res.json()
}

export async function fetchRawHtmlByUrl(url){
  const encodedUrl = encodeURIComponent(url)
  const res = await fetch(`${BASE_URL}/quiz/url/${encodedUrl}/raw_html`)
  if(!res.ok){
    if(res.status === 404){
      throw new Error('Raw HTML not available for this quiz')
    }
    throw new Error('Failed to load raw HTML')
  }
  return await res.json()
}


