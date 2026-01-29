import { useEffect, useMemo, useState, useCallback } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { getGraves, getGlobalRespects } from "@/server/graves";
import { Gravestone } from "@/components/Gravestone";
import { useHomeRespects } from "@/components/HomeRespectsContext";
import type { Grave } from "@/server/schema";

const GRAVES_PER_PAGE = 6;

export const Route = createFileRoute("/")({
  component: HomePage,
  loader: async () => {
    const [gravesData, globalRespects] = await Promise.all([getGraves({ data: { limit: GRAVES_PER_PAGE, offset: 0 } }), getGlobalRespects()]);
    return { gravesData, globalRespects };
  },
});

// Random low number for "tests written" (always abysmally low)
function getRandomTestsWritten(projectCount: number) {
  const base = Math.max(10, projectCount * 4);
  const swing = Math.max(6, projectCount * 6);
  const roll = Math.random();
  const skewed = Math.floor(Math.pow(roll, 0.65) * swing);
  return base + skewed;
}

function useCountUp(value: number, durationMs = 700) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const target = Math.max(0, Math.floor(value));
    if (target === 0) {
      setDisplayValue(0);
      return;
    }

    let startTime: number | null = null;
    let rafId = 0;

    const tick = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const nextValue = Math.floor(progress * target);
      setDisplayValue(nextValue);

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [value, durationMs]);

  return displayValue;
}

function HomePage() {
  const { gravesData, globalRespects } = Route.useLoaderData();

  // State for paginated graves
  const [graves, setGraves] = useState<Grave[]>(gravesData.graves);
  const [hasMore, setHasMore] = useState(gravesData.hasMore);
  const [total, setTotal] = useState(gravesData.total);
  const [isLoading, setIsLoading] = useState(false);

  const testsWritten = useMemo(() => getRandomTestsWritten(total), [total]);
  const homeRespects = useHomeRespects();
  const setTotalRespects = homeRespects?.setTotalRespects;
  const totalStars = graves.reduce((acc, g) => acc + (g.starCount || 0), 0);

  const totalGravesDisplay = useCountUp(total);
  const totalStarsDisplay = useCountUp(totalStars);
  const testsWrittenDisplay = useCountUp(testsWritten);

  useEffect(() => {
    if (!setTotalRespects) return;
    setTotalRespects(globalRespects);
    return () => setTotalRespects(null);
  }, [setTotalRespects, globalRespects]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const result = await getGraves({
        data: { limit: GRAVES_PER_PAGE, offset: graves.length },
      });
      setGraves((prev) => [...prev, ...result.graves]);
      setHasMore(result.hasMore);
      setTotal(result.total);
    } catch (error) {
      console.error("Failed to load more graves:", error);
    } finally {
      setIsLoading(false);
    }
  }, [graves.length, hasMore, isLoading]);

  return (
    <div className="mx-auto px-6 sm:px-10 py-6 sm:py-10" style={{ maxWidth: "75rem" }}>
      {/* Hero section */}
      <div className="text-center mb-10 sm:mb-12">
        <h2 className="text-xl sm:text-2xl md:text-3xl glow-text mb-4 flicker">REST IN PEACE</h2>
        <p className="readable text-[var(--grave-green-dim)] max-w-xl mx-auto">
          A memorial to vibe-coded projects, shared with great fanfare, then quietly abandoned. Here lie the dreams of weekend hackathons and "I'll maintain this later" promises.
        </p>

        <Link to="/submit" className="pixel-btn inline-block mt-6 text-[10px]">
          SUBMIT A PROJECT
        </Link>
      </div>

      {/* Graveyard grid */}
      {total === 0 ? (
        <div className="text-center py-20">
          <p className="text-base sm:text-lg glow-text-dim mb-4">THE GRAVEYARD IS EMPTY</p>
          <p className="readable text-[var(--grave-green-dim)]">No projects are laid to rest yet. Be the first to bury one.</p>
        </div>
      ) : (
        <>
          <div className="readable-sm text-[var(--grave-green)] mb-4 text-center opacity-80">
            {total} PROJECT{total !== 1 ? "S" : ""} INTERRED
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-10 lg:gap-y-12 lg:gap-x-16">
            {graves.map((grave, index) => (
              <Gravestone key={grave.id} grave={grave} index={index} />
            ))}
          </div>

          {/* Load more button */}
          {hasMore && (
            <div className="text-center mt-12">
              <button
                onClick={loadMore}
                disabled={isLoading}
                className="pixel-btn text-[10px] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "var(--grave-green-dim)",
                  boxShadow: "4px 4px 0 0 #001a00",
                }}
              >
                {isLoading ? "EXHUMING..." : "EXHUME MORE GRAVES"}
              </button>
            </div>
          )}
        </>
      )}

      {/* Sarcastic stats section */}
      <div className="mt-12 sm:mt-16 py-8 border-t-2 border-[var(--grave-green-dim)]">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl glow-text mb-2 tabular-nums">{totalGravesDisplay.toLocaleString()}</div>
            <div className="text-sm text-[var(--grave-green)] opacity-70 tracking-wide">TOTAL GRAVES</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl glow-text mb-2 tabular-nums">{totalStarsDisplay.toLocaleString()}</div>
            <div className="text-sm text-[var(--grave-green)] opacity-70 tracking-wide">STARS EULOGIZED</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl glow-text mb-2">∞</div>
            <div className="text-sm text-[var(--grave-green)] opacity-70 tracking-wide">ROADMAPS ABANDONED</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl glow-text mb-2 tabular-nums">{testsWrittenDisplay}</div>
            <div className="text-sm text-[var(--grave-green)] opacity-70 tracking-wide">TESTS (ALLEGED)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
