import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'

import { Header } from '@/components/Header'
import { GraveyardBackground } from '@/components/GraveyardBackground'
import { CRTOverlay } from '@/components/CRTOverlay'

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
      { property: 'og:image', content: 'https://vibegraveyard.rip/og-image.svg' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Vibe Graveyard' },
      { name: 'twitter:description', content: 'Where abandoned vibe-coded projects rest in peace. F to pay respects.' },
      { name: 'twitter:image', content: 'https://vibegraveyard.rip/og-image.svg' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'apple-touch-icon', href: '/favicon.svg' },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen">
        <GraveyardBackground />
        <CRTOverlay />
        <div className="relative z-10">
          <Header />
          <main>
            <Outlet />
          </main>
          <footer className="relative z-10 py-8 px-4 text-center readable-xs text-[var(--grave-green-dim)]">
            <p>GAME OVER - INSERT COIN TO CONTINUE</p>
            <p className="mt-2 opacity-50">
              A sarcastic memorial for abandoned projects. No malice intended.
            </p>
          </footer>
        </div>
        <Scripts />
      </body>
    </html>
  )
}
