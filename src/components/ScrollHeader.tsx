import { useEffect, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { gsap } from 'gsap';
import { createHeaderIndicator } from '../scripts/header-indicator';

interface Props {
  children: ReactNode;
}

export default function ScrollHeader({ children }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [visibility, setVisibility] = useState({
    hidden: false,
    scrolled: false,
  });

  useEffect(() => {
    const header = root.current;
    if (!header) return;
    const clearIndicator = createHeaderIndicator(header);

    let previousY = Math.max(0, window.scrollY);
    let directionStart = previousY;
    let direction = 0;
    let frame = 0;
    let hidden = false;
    let scrolled = false;
    let reduced = false;
    let introduced = false;
    const context = gsap.context(() => {}, header);
    const media = gsap.matchMedia();
    const position = (immediate = false) =>
      context.add(() => {
        // This island is the only owner of the fixed header's position.
        gsap.to(header, {
          yPercent: hidden ? -100 : 0,
          duration: reduced || immediate ? 0 : 0.28,
          ease: 'power2.out',
          overwrite: true,
        });
      });
    media.add(
      {
        normal: '(prefers-reduced-motion: no-preference)',
        reduced: '(prefers-reduced-motion: reduce)',
      },
      (scope) => {
        reduced = !!scope.conditions?.reduced;
        position(true);
        if (!introduced && !reduced) {
          gsap.from(header.querySelector('.wordmark'), {
            opacity: 0,
            y: 8,
            duration: 0.5,
            ease: 'power2.out',
            clearProps: 'opacity,transform',
          });
          gsap.from(
            header.querySelectorAll(
              '.nav-left a, .nav-right > *, .menu-toggle',
            ),
            {
              opacity: 0,
              y: 6,
              duration: 0.45,
              stagger: 0.05,
              ease: 'power2.out',
              clearProps: 'opacity,transform',
            },
          );
        }
        introduced = true;
      },
    );

    const reveal = () => {
      directionStart = Math.max(0, window.scrollY);
      if (!hidden) return;
      hidden = false;
      position(true);
      setVisibility({ hidden, scrolled });
    };

    const update = () => {
      frame = 0;
      const bottom = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const y = Math.min(bottom, Math.max(0, window.scrollY));
      const nextDirection = Math.sign(y - previousY);
      if (nextDirection && nextDirection !== direction) {
        direction = nextDirection;
        directionStart = previousY;
      }

      const nearTop = y <= header.offsetHeight;
      const interacting =
        header.querySelector('[aria-expanded="true"], :focus-visible') !==
          null || document.querySelector('dialog[open]') !== null;
      let nextHidden = hidden;
      if (nearTop || interacting) {
        nextHidden = false;
        directionStart = y;
      } else if (Math.abs(y - directionStart) >= 8) {
        nextHidden = direction > 0;
      }

      // Keep the compact state independent of the animated header height.
      const nextScrolled = y > 8;
      if (nextHidden !== hidden || nextScrolled !== scrolled) {
        const changedPosition = hidden !== nextHidden;
        hidden = nextHidden;
        scrolled = nextScrolled;
        if (changedPosition) position();
        setVisibility({ hidden, scrolled });
      }
      previousY = y;
    };

    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      // Restore navigation before the browser moves keyboard focus.
      if (event.key === 'Tab' && hidden) flushSync(reveal);
    };

    update();
    const interactions = new MutationObserver(scheduleUpdate);
    interactions.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['open', 'aria-expanded'],
    });
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('keydown', onKeyDown);
    header.addEventListener('focusin', reveal);
    return () => {
      clearIndicator();
      interactions.disconnect();
      media.revert();
      context.revert();
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('keydown', onKeyDown);
      header.removeEventListener('focusin', reveal);
    };
  }, []);

  return (
    <div
      ref={root}
      data-scroll-header
      data-hidden={visibility.hidden}
      data-scrolled={visibility.scrolled}
      inert={visibility.hidden}
      className="group/scroll-header fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-300 ease-floral data-[hidden=true]:pointer-events-none data-[scrolled=true]:bg-paper/95 data-[scrolled=true]:shadow-soft data-[scrolled=true]:backdrop-blur-md motion-reduce:transition-none"
    >
      {children}
    </div>
  );
}
