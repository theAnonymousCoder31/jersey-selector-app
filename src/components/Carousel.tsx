import {
  useState,
  useEffect,
  useRef,
  TouchEvent as ReactTouchEvent,
  useLayoutEffect,
} from "react";
import { Jersey } from "../types/jersey";
import { JerseyCard } from "./JerseyCard";

interface CarouselProps {
  jerseys: Jersey[];
  selectedJerseyId: string | null;
  onSelectJersey: (id: string) => void;
}

export const Carousel = ({
  jerseys,
  selectedJerseyId,
  onSelectJersey,
}: CarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined
  );

  // measurements and refs for single-card viewport behavior
  const [slideWidth, setSlideWidth] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [totalWidth, setTotalWidth] = useState(0);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const firstSlideRef = useRef<HTMLDivElement | null>(null);

  // measure slide width to fill the viewport so exactly one card is visible
  const measure = () => {
    const viewport = viewportRef.current;
    const slide = firstSlideRef.current;
    const track = trackRef.current;
    if (!viewport || !slide || !track) return;

    // compute available inner width of the viewport (subtract viewport padding)
    const vpRect = viewport.getBoundingClientRect();
    const style = window.getComputedStyle(viewport);
    const paddingLeft = parseFloat(style.paddingLeft || "0") || 0;
    const paddingRight = parseFloat(style.paddingRight || "0") || 0;
    const available = Math.round(vpRect.width - paddingLeft - paddingRight);

    // responsive gap: smaller on narrow screens
    const computedGap = vpRect.width < 520 ? 12 : 18;

    // Choose slide width so cards are a bit smaller than full viewport on small screens
    // This allows a peek of neighboring cards and avoids overly large cards on phones.
    let computedSlideWidth: number;
    if (vpRect.width < 420) {
      // very small phones: make card ~80% of viewport up to a max of 200 (reduced)
      computedSlideWidth = Math.min(200, Math.round(available * 0.8));
    } else if (vpRect.width < 600) {
      // small tablets / large phones: ~85% of viewport up to 240
      computedSlideWidth = Math.min(240, Math.round(available * 0.85));
    } else {
      // larger screens: let slides fill available width
      computedSlideWidth = Math.min(320, available);
    }

    // enforce reasonable bounds
    computedSlideWidth = Math.max(170, Math.min(computedSlideWidth, available));

    setSlideWidth(computedSlideWidth);
    setViewportWidth(Math.round(vpRect.width));

    const total = Math.round(
      computedSlideWidth * jerseys.length + computedGap * (jerseys.length - 1)
    );
    setTotalWidth(total);
  };

  // measure on mount and when jerseys change, and on resize
  useLayoutEffect(() => {
    measure();
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jerseys.length]);

  // clamp current index if jerseys length changes
  useEffect(() => {
    if (currentIndex > jerseys.length - 1) {
      setCurrentIndex(Math.max(0, jerseys.length - 1));
    }
  }, [jerseys.length]);

  const navigateCarousel = (direction: number) => {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < jerseys.length) {
      setCurrentIndex(newIndex);
    }
  };

  const handleTouchStart = (e: ReactTouchEvent) => {
    setTouchStart(e.touches[0].screenX);
    stopAutoPlay();
  };

  const handleTouchEnd = (e: ReactTouchEvent) => {
    const touchEnd = e.changedTouches[0].screenX;
    const swipeThreshold = 50;
    const swipeDistance = touchStart - touchEnd;

    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0 && currentIndex < jerseys.length - 1) {
        navigateCarousel(1);
      } else if (swipeDistance < 0 && currentIndex > 0) {
        navigateCarousel(-1);
      }
    }
  };

  const startAutoPlay = () => {
    if (!selectedJerseyId) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((current) => {
          if (current < jerseys.length - 1) return current + 1;
          return 0;
        });
      }, 4000);
    }
  };

  const stopAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = undefined;
    }
  };

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedJerseyId]);

  // compute maximum allowed translate so we don't leave empty space after last slide
  const gap = viewportWidth < 520 ? 12 : 18; // responsive gap to match CSS
  const step = (slideWidth || 0) + gap;
  const totalTrackWidth = step * jerseys.length - gap;
  const maxTranslate = Math.max(0, totalTrackWidth - viewportWidth);
  const desiredTranslate = step * currentIndex;
  // center the active slide in the viewport when there's extra space
  const centerOffset = Math.max(
    0,
    Math.round((viewportWidth - slideWidth) / 2)
  );
  const translateX = Math.min(
    Math.max(desiredTranslate - centerOffset, 0),
    maxTranslate
  );

  // responsive control / indicator sizes
  const controlBtnSize = viewportWidth && viewportWidth < 520 ? 44 : 56;
  const indicatorSize = viewportWidth && viewportWidth < 520 ? 10 : 12;

  const trackStyle: React.CSSProperties = {
    transform: slideWidth ? `translateX(-${translateX}px)` : undefined,
    transition: "transform 420ms cubic-bezier(.22,.9,.2,1)",
    display: "flex",
    alignItems: "stretch",
    gap: `${gap}px`,
  };

  const viewportStyle: React.CSSProperties = {
    overflow: "hidden",
    borderRadius: 18,
    padding: 12,
    maxWidth: "100%",
    margin: "0 auto",
    background:
      "linear-gradient(135deg, rgba(7,16,54,0.9), rgba(183,26,26,0.02))",
    boxShadow: "0 18px 80px rgba(7,16,54,0.45), 0 0 90px rgba(183,26,26,0.08)",
    border: "1px solid rgba(212,175,55,0.06)",
  };

  const slideWrapperStyle: React.CSSProperties = {
    // ensure a single slide fills the viewport width used for slides
    flex: `0 0 ${slideWidth || 170}px`,
    width: slideWidth || 170,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: viewportWidth && viewportWidth < 420 ? 8 : 12,
  };

  const neonCardStyle: React.CSSProperties = {
    borderRadius: 14,
    boxShadow:
      "0 30px 100px rgba(183,26,26,0.18), 0 0 28px rgba(212,175,55,0.14), inset 0 1px 0 rgba(255,255,255,0.03)",
    transition: "transform .14s ease, box-shadow .14s ease",
    transformOrigin: "center",
    border: "1px solid rgba(212,175,55,0.12)",
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") navigateCarousel(-1);
    if (e.key === "ArrowRight") navigateCarousel(1);
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, jerseys.length]);

  // Improve touch dragging (translate track during touchmove for a smoother feel)
  const touchMoveRef = useRef<number | null>(null);
  const handleTouchMove = (e: ReactTouchEvent) => {
    if (!viewportRef.current || !trackRef.current) return;
    const touchX = e.touches[0].clientX;
    if (touchStart === 0) return;
    const delta = touchStart - touchX;
    // small drag - don't update index, just translate visually
    const drag = Math.max(-viewportWidth, Math.min(delta, viewportWidth));
    if (trackRef.current) {
      trackRef.current.style.transition = "none";
      trackRef.current.style.transform = `translateX(-${Math.min(Math.max(step * currentIndex + drag, 0), maxTranslate)}px)`;
      touchMoveRef.current = drag;
    }
  };

  const handleTouchEndEnhanced = (e: ReactTouchEvent) => {
    const touchEnd = e.changedTouches[0].screenX;
    const swipeThreshold = 50;
    const swipeDistance = touchStart - touchEnd;

    // restore transition
    if (trackRef.current) trackRef.current.style.transition = "transform 420ms cubic-bezier(.22,.9,.2,1)";
    if (touchMoveRef.current !== null) touchMoveRef.current = null;

    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0 && currentIndex < jerseys.length - 1) {
        navigateCarousel(1);
      } else if (swipeDistance < 0 && currentIndex > 0) {
        navigateCarousel(-1);
      }
    }
    setTouchStart(0);
    !selectedJerseyId && startAutoPlay();
  };

  return (
    <div className="carousel-wrapper" style={{ padding: 8 }}>
      <div
        className="carousel-viewport"
        style={viewportStyle}
        onMouseEnter={stopAutoPlay}
        onMouseLeave={() => !selectedJerseyId && startAutoPlay()}
        ref={viewportRef}
      >
        <div
          className="carousel-track"
          style={trackStyle}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEndEnhanced}
           ref={trackRef}
        >
          {jerseys.map((jersey, idx) => (
            <div
              key={jersey.id}
              className="carousel-slide"
              ref={idx === 0 ? firstSlideRef : undefined}
              style={slideWrapperStyle}
            >
              <div style={{ ...neonCardStyle, width: "100%" }}>
                <JerseyCard
                  jersey={jersey}
                  isSelected={jersey.id === selectedJerseyId}
                  onSelect={onSelectJersey}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="controls"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          justifyContent: "center",
          marginTop: 12,
        }}
      >
        <button
          className="control-btn"
          onClick={() => navigateCarousel(-1)}
          disabled={currentIndex === 0}
          aria-label="Previous"
          style={{
            background:
              "linear-gradient(180deg, rgba(212,175,55,0.12), rgba(183,26,26,0.06))",
            border: "1px solid rgba(212,175,55,0.18)",
            width: controlBtnSize,
            height: controlBtnSize,
            borderRadius: 999,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            color: "white",
            boxShadow:
              currentIndex === 0
                ? "none"
                : "0 12px 36px rgba(183,26,26,0.24), 0 0 28px rgba(212,175,55,0.12)",
            cursor: currentIndex === 0 ? "not-allowed" : "pointer",
            transition: "transform .12s ease, box-shadow .12s ease",
          }}
        >
          ‹
        </button>

        <div
          className="indicators"
          role="tablist"
          aria-label="Jersey slides"
          style={{ display: "flex", gap: 8, alignItems: "center" }}
        >
          {jerseys.map((_, index) => (
            <div
              key={index}
              className={`indicator ${
                index === currentIndex ? "indicator-active" : ""
              }`}
              onClick={() => setCurrentIndex(index)}
              role="tab"
              aria-selected={index === currentIndex}
              aria-label={`Go to jersey ${index + 1}`}
              style={{
                width: indicatorSize,
                height: indicatorSize,
                borderRadius: 999,
                background:
                  index === currentIndex
                    ? "linear-gradient(90deg,#D4AF37,#bfa23a)"
                    : "rgba(212,175,55,0.12)",
                boxShadow:
                  index === currentIndex
                    ? "0 10px 30px rgba(212,175,55,0.22)"
                    : "none",
                cursor: "pointer",
                border: "1px solid rgba(7,16,54,0.12)",
              }}
            />
          ))}
        </div>

        <button
          className="control-btn"
          onClick={() => navigateCarousel(1)}
          disabled={currentIndex === jerseys.length - 1}
          aria-label="Next"
          style={{
            background:
              "linear-gradient(180deg, rgba(212,175,55,0.12), rgba(183,26,26,0.06))",
            border: "1px solid rgba(212,175,55,0.18)",
            width: controlBtnSize,
            height: controlBtnSize,
            borderRadius: 999,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            color: "white",
            boxShadow:
              currentIndex === jerseys.length - 1
                ? "none"
                : "0 12px 36px rgba(183,26,26,0.24), 0 0 28px rgba(212,175,55,0.12)",
            cursor:
              currentIndex === jerseys.length - 1 ? "not-allowed" : "pointer",
            transition: "transform .12s ease, box-shadow .12s ease",
          }}
        >
          ›
        </button>
      </div>
    </div>
  );
};
