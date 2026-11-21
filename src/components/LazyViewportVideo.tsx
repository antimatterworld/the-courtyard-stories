import { useEffect, useRef, type VideoHTMLAttributes } from "react";

let playingCount = 0;
const playingEls = new Set<HTMLVideoElement>();

function release(el: HTMLVideoElement) {
  if (playingEls.has(el)) {
    playingEls.delete(el);
    playingCount = Math.max(0, playingCount - 1);
  }
}

function tryPlay(el: HTMLVideoElement) {
  if (playingCount >= 2) return;
  void el.play()
    .then(() => {
      if (!el.paused) {
        playingEls.add(el);
        playingCount += 1;
      }
    })
    .catch(() => {});
}

type Props = VideoHTMLAttributes<HTMLVideoElement> & {
  /** Play when pointer enters (hover-capable devices only). */
  playOnHover?: boolean;
};

export function LazyViewportVideo({
  playOnHover = true,
  className,
  poster,
  src,
  loop = true,
  muted = true,
  playsInline = true,
  ...rest
}: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let inView = false;
    let hovered = false;

    const updatePlayback = () => {
      if (!inView) {
        el.pause();
        release(el);
        return;
      }
      if (canHover && playOnHover) {
        if (hovered) tryPlay(el);
        else {
          el.pause();
          release(el);
        }
      } else {
        tryPlay(el);
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry?.isIntersecting ?? false;
        updatePlayback();
      },
      { threshold: 0.25, rootMargin: "8% 0px" },
    );
    io.observe(el);

    const onEnter = () => {
      hovered = true;
      updatePlayback();
    };
    const onLeave = () => {
      hovered = false;
      updatePlayback();
    };

    if (canHover && playOnHover) {
      el.addEventListener("pointerenter", onEnter);
      el.addEventListener("pointerleave", onLeave);
    }

    return () => {
      io.disconnect();
      el.pause();
      release(el);
      if (canHover && playOnHover) {
        el.removeEventListener("pointerenter", onEnter);
        el.removeEventListener("pointerleave", onLeave);
      }
    };
  }, [playOnHover]);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      preload="none"
      loop={loop}
      muted={muted}
      playsInline={playsInline}
      {...rest}
    />
  );
}