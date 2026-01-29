import { createContext, useCallback, useContext, useMemo, useState } from 'react'

type HomeRespectsContextValue = {
  totalRespects: number | null
  setTotalRespects: (value: number | null) => void
  incrementTotalRespects: () => void
}

const HomeRespectsContext = createContext<HomeRespectsContextValue | null>(null)

export function HomeRespectsProvider({ children }: { children: React.ReactNode }) {
  const [totalRespects, setTotalRespects] = useState<number | null>(null)

  const incrementTotalRespects = useCallback(() => {
    setTotalRespects((prev) => (prev ?? 0) + 1)
  }, [])

  const value = useMemo<HomeRespectsContextValue>(
    () => ({ totalRespects, setTotalRespects, incrementTotalRespects }),
    [totalRespects, incrementTotalRespects]
  )

  return (
    <HomeRespectsContext.Provider value={value}>
      {children}
    </HomeRespectsContext.Provider>
  )
}

export function useHomeRespects() {
  return useContext(HomeRespectsContext)
}
