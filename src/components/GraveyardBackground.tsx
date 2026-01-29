import { useEffect, useState } from 'react'

export function GraveyardBackground() {
  const [stars, setStars] = useState<{ x: number; y: number; delay: number }[]>([])

  useEffect(() => {
    // Generate random stars
    const newStars = Array.from({ length: 50 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 40, // Only in top 40% of screen
      delay: Math.random() * 3,
    }))
    setStars(newStars)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Dark gradient sky */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #000 0%, #0a0a0a 30%, #0f1a0f 60%, #1a2a1a 100%)',
        }}
      />
      
      {/* Stars */}
      {stars.map((star, i) => (
        <div
          key={i}
          className="star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
      
      {/* Pixel moon */}
      <div 
        className="absolute top-[5%] right-[10%] w-16 h-16 rounded-full"
        style={{
          background: 'radial-gradient(circle at 30% 30%, #ffffaa 0%, #cccc88 50%, #888866 100%)',
          boxShadow: '0 0 30px #ffff0033, 0 0 60px #ffff0022',
        }}
      >
        {/* Moon craters */}
        <div className="absolute top-[20%] left-[40%] w-2 h-2 rounded-full bg-[#999977]" />
        <div className="absolute top-[50%] left-[20%] w-3 h-3 rounded-full bg-[#999977]" />
        <div className="absolute top-[60%] left-[60%] w-2 h-2 rounded-full bg-[#999977]" />
      </div>
      
      {/* Fog layer at bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{
          background: 'linear-gradient(0deg, rgba(0,255,0,0.05) 0%, transparent 100%)',
        }}
      />
      
      {/* Distant trees silhouette */}
      <div className="absolute bottom-20 left-0 right-0 h-24 opacity-30">
        <svg viewBox="0 0 200 30" className="w-full h-full" preserveAspectRatio="none">
          <path 
            d="M0,30 L0,25 L5,20 L10,25 L15,15 L20,25 L25,20 L30,25 L30,30 Z M40,30 L40,22 L45,12 L50,22 L55,18 L60,22 L60,30 Z M80,30 L80,20 L85,10 L90,20 L95,15 L100,20 L100,30 Z M120,30 L120,25 L125,15 L130,25 L135,20 L140,25 L140,30 Z M160,30 L160,22 L165,8 L170,22 L175,18 L180,22 L180,30 Z"
            fill="var(--grave-green-dim)"
          />
        </svg>
      </div>
    </div>
  )
}
