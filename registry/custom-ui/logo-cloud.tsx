"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface LogoCloudItem {
  name: string;
  src?: string;
  alt?: string;
  href?: string;
  logo?: React.ReactNode;
  className?: string;
}

export interface LogoCloudProps
  extends Omit<React.ComponentProps<"div">, "children"> {
  logos: LogoCloudItem[];
  setSize?: number;
  interval?: number;
  pauseOnHover?: boolean;
  animateOnView?: boolean;
  cellClassName?: string;
  logoClassName?: string;
  gridClassName?: string;
}

const DEFAULT_SET_SIZE = 6;
const DEFAULT_INTERVAL = 4000;
const DURATION = 500;
const STAGGER = 60;
const EASE_SCALE_OUT = "cubic-bezier(0.55, 0, 0.85, 0.15)";
const EASE_SCALE_IN = "cubic-bezier(0.15, 0.85, 0.35, 1)";

function chunkLogos(logos: LogoCloudItem[], size: number) {
  if (logos.length <= size) return [logos];

  return Array.from({ length: Math.ceil(logos.length / size) }, (_, index) => {
    const set = logos.slice(index * size, index * size + size);

    while (set.length < size) {
      set.push(logos[(index * size + set.length) % logos.length]);
    }

    return set;
  });
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(query.matches);

    const updatePreference = () => setPrefersReducedMotion(query.matches);
    query.addEventListener("change", updatePreference);

    return () => query.removeEventListener("change", updatePreference);
  }, []);

  return prefersReducedMotion;
}

function useInView<TElement extends Element>(
  ref: React.RefObject<TElement | null>,
  enabled: boolean,
) {
  const [isInView, setIsInView] = React.useState(!enabled);

  React.useEffect(() => {
    const element = ref.current;
    if (!enabled || !element) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(Boolean(entry?.isIntersecting)),
      { threshold: 0.3 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [enabled, ref]);

  return isInView;
}

function LogoCloud({
  className,
  logos,
  setSize = DEFAULT_SET_SIZE,
  interval = DEFAULT_INTERVAL,
  pauseOnHover = true,
  animateOnView = true,
  cellClassName,
  logoClassName,
  gridClassName,
  ...props
}: LogoCloudProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const pausedRef = React.useRef(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isInView = useInView(rootRef, animateOnView);

  const normalizedSetSize = Math.min(Math.max(1, setSize), logos.length || 1);
  const sets = React.useMemo(
    () => chunkLogos(logos, normalizedSetSize),
    [logos, normalizedSetSize],
  );
  const [activeSet, setActiveSet] = React.useState(0);

  React.useEffect(() => {
    setActiveSet(0);
  }, [logos, normalizedSetSize]);

  React.useEffect(() => {
    if (sets.length <= 1 || prefersReducedMotion || !isInView) return;

    const timer = window.setInterval(() => {
      if (!pausedRef.current) {
        setActiveSet((currentSet) => (currentSet + 1) % sets.length);
      }
    }, interval);

    return () => window.clearInterval(timer);
  }, [interval, isInView, prefersReducedMotion, sets.length]);

  if (logos.length === 0) return null;

  return (
    <div
      ref={rootRef}
      className={cn("w-full overflow-hidden", className)}
      data-slot="logo-cloud"
      onMouseEnter={() => {
        if (pauseOnHover) pausedRef.current = true;
      }}
      onMouseLeave={() => {
        if (pauseOnHover) pausedRef.current = false;
      }}
      {...props}
    >
      <div
        className={cn(
          "grid grid-cols-3 gap-10 md:grid-cols-6",
          gridClassName,
        )}
        data-slot="logo-cloud-grid"
        role="list"
      >
        {Array.from({ length: normalizedSetSize }, (_, position) => (
          <div
            className={cn(
              "relative flex h-[60px] items-center justify-center overflow-hidden md:h-[80px]",
              cellClassName,
            )}
            data-slot="logo-cloud-cell"
            key={position}
            role="listitem"
          >
            {sets.map((set, setIndex) => {
              const logo = set[position];
              if (!logo) return null;

              const isActive = setIndex === activeSet;

              return (
                <LogoCloudLogo
                  isActive={isActive}
                  item={logo}
                  key={`${setIndex}-${logo.name}`}
                  logoClassName={logoClassName}
                  position={position}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function LogoCloudLogo({
  item,
  isActive,
  position,
  logoClassName,
}: {
  item: LogoCloudItem;
  isActive: boolean;
  position: number;
  logoClassName?: string;
}) {
  const delay = isActive ? position * STAGGER + DURATION : position * STAGGER;
  const logo = item.logo ?? (
    <>
      {item.src ? (
        <img
          alt={item.alt ?? item.name}
          className={cn(
            "max-h-10 w-auto max-w-[110px] object-contain md:max-h-11 md:max-w-[125px]",
            logoClassName,
            item.className,
          )}
          loading="lazy"
          src={item.src}
        />
      ) : (
        <span
          className={cn(
            "truncate text-center text-sm font-semibold tracking-tight text-muted-foreground",
            logoClassName,
            item.className,
          )}
        >
          {item.name}
        </span>
      )}
    </>
  );

  const content = item.href ? (
    <a
      className="flex size-full items-center justify-center"
      href={item.href}
      tabIndex={isActive ? undefined : -1}
    >
      {logo}
    </a>
  ) : (
    logo
  );

  return (
    <div
      aria-hidden={!isActive}
      className={cn(
        "absolute inset-0 flex items-center justify-center will-change-[opacity,transform,filter]",
        !isActive && "pointer-events-none",
      )}
      data-active={isActive}
      data-slot="logo-cloud-logo"
      style={{
        filter: isActive ? "blur(0px)" : "blur(4px)",
        opacity: isActive ? 1 : 0,
        transform: isActive ? "scale(1)" : "scale(0)",
        transitionDelay: `${delay}ms`,
        transitionDuration: `${DURATION}ms`,
        transitionProperty: "opacity, transform, filter",
        transitionTimingFunction: isActive ? EASE_SCALE_IN : EASE_SCALE_OUT,
      }}
    >
      {content}
    </div>
  );
}

export { LogoCloud };
