import React from 'react'

/**
 * Version ultra-performante sans Framer Motion pour éliminer les clignotements.
 * Utilise des classes CSS standards qui sont accélérées par le GPU.
 */

export const PageTransition = ({ children }) => {
  return (
    <div className="animate-in-fade">
      {children}
    </div>
  )
}

export const FadeIn = ({ children, delay = 0, className = '' }) => {
  const style = delay ? { 
    animationDelay: `${delay}s`,
    opacity: 0 // Garde caché avant le début de l'anim
  } : {}
  
  return (
    <div 
      className={`animate-in-fade ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}
