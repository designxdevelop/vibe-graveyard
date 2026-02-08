import { useState } from 'react'
import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'

import { Header } from '@/components/Header'
import { GraveyardBackground } from '@/components/GraveyardBackground'
import { CRTOverlay } from '@/components/CRTOverlay'
import { PressF } from '@/components/PressF'
import { HomeRespectsProvider } from '@/components/HomeRespectsContext'
import { GhostHunterGame } from '@/components/GhostHunterGame'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Vibe Graveyard - Where Abandoned Projects Rest' },
      { name: 'description', content: 'A sarcastic memorial for vibe-coded projects that maintainers abandoned after sharing publicly. Submit your own or browse the departed.' },
      { name: 'theme-color', content: '#0a0a0a' },
      // Open Graph
      { property: 'og:title', content: 'Vibe Graveyard' },
      { property: 'og:description', content: 'Where abandoned vibe-coded projects rest in peace. F to pay respects.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:image', content: 'https://vibegraveyard.rip/og-image.png' },
      { property: 'og:image:type', content: 'image/png' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Vibe Graveyard' },
      { name: 'twitter:description', content: 'Where abandoned vibe-coded projects rest in peace. F to pay respects.' },
      { name: 'twitter:image', content: 'https://vibegraveyard.rip/og-image.png' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'icon', type: 'image/png', href: '/favicon.png' },
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'apple-touch-icon', href: '/favicon.png' },
    ],
  }),
  component: RootComponent,
  notFoundComponent: () => (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl glow-text mb-4">PAGE NOT FOUND</h2>
      <p className="readable text-[var(--grave-green-dim)] mb-8">
        This path has been reclaimed by the void. Return to the graveyard.
      </p>
      <a href="/" className="pixel-btn readable-sm">
        RETURN TO GRAVEYARD
      </a>
    </div>
  ),
})

function RootComponent() {
  const [showGame, setShowGame] = useState(false)

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen">
        <GraveyardBackground />
        <CRTOverlay />
        <HomeRespectsProvider>
          <PressF />
          <div className="relative z-10">
            <Header />
            <main>
              <Outlet />
            </main>
            <footer className="relative z-10 py-8 px-4 text-center readable-xs">
              <button 
                className="insert-coin-btn"
                onClick={() => setShowGame(true)}
              >
                GAME OVER - INSERT COIN TO CONTINUE
              </button>
              <p className="mt-2 text-[var(--grave-green)] opacity-70">
                A sarcastic memorial for abandoned projects. No malice intended. Only a gentle roast.
              </p>
            </footer>
          </div>
          {showGame && <GhostHunterGame onClose={() => setShowGame(false)} />}
        </HomeRespectsProvider>
        <Scripts />
      </body>
    </html>
  )
}
