import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setupWhatsApp } from './motion-whatsapp';

const visited = new WeakSet<Element>();
type Timeline = gsap.core.Timeline;
type Build = (timeline: Timeline, root: HTMLElement) => void;

/** Scoped contexts are reverted when matchMedia changes or the page unmounts. */
export function setupSections(
  conditions: Record<string, boolean>,
  refresh: () => void,
) {
  const contexts: gsap.Context[] = [];
  const listeners = new AbortController();
  const running = new Map<HTMLElement, Timeline>();
  const decorations: HTMLElement[] = [];
  const reduced = conditions.reduced;
  const all = (root: ParentNode, selector: string) => [
    ...root.querySelectorAll<HTMLElement>(selector),
  ];
  const add = (
    timeline: Timeline,
    root: ParentNode,
    selector: string,
    position: number,
    vars: gsap.TweenVars = {},
  ) => {
    const targets = all(root, selector);
    if (targets.length)
      timeline.from(
        targets,
        {
          opacity: 0,
          y: 16,
          duration: 0.65,
          ease: 'power2.out',
          clearProps: 'opacity,transform',
          ...vars,
        },
        position,
      );
  };
  function entry(element: HTMLElement, build: Build, immediate = false) {
    if (reduced || visited.has(element) || !element.checkVisibility()) return;
    const context = gsap.context(() => {}, element);
    contexts.push(context);
    const play = () =>
      context.add(() => {
        if (visited.has(element)) return;
        visited.add(element);
        if (element.contains(document.activeElement)) return;
        const timeline = gsap.timeline({
          onComplete: () => running.delete(element),
        });
        running.set(element, timeline);
        build(timeline, element);
      });
    if (immediate) play();
    else
      context.add(() =>
        ScrollTrigger.create({
          trigger: element,
          start: 'top 85%',
          once: true,
          onEnter: play,
        }),
      );
  }
  function each(selector: string, build: Build) {
    all(document, selector).forEach((element) => entry(element, build));
  }
  function line(root: HTMLElement, edge: 'top' | 'bottom', fromCenter = false) {
    const element = document.createElement('span');
    element.dataset.motionLine = edge;
    element.setAttribute('aria-hidden', 'true');
    root.append(element);
    decorations.push(element);
    gsap.set(element, { transformOrigin: fromCenter ? 'center' : 'left' });
    return element;
  }

  each('.hero', (t, root) => {
    add(t, root, '.hero-kicker', 0, { y: 16, duration: 0.55 });
    add(t, root, '[data-hero-line]', 0.08, {
      y: 22,
      stagger: 0.12,
      duration: 0.7,
    });
    add(t, root, '.hero-bouquet-image', 0.04, {
      y: 24,
      scale: 0.98,
      duration: 0.85,
      ease: 'power3.out',
    });
    add(t, root, '.hero-copy', 0.38, { y: 12, stagger: 0.08, duration: 0.6 });
    if (!conditions.small)
      add(t, root, '.feature-card', 0.52, {
        y: 12,
        stagger: 0.06,
        duration: 0.55,
      });
    add(t, root, '.hero-cta', 0.72, { y: 8, duration: 0.55 });
    add(t, root, '.hero-bottom', 0.8, { y: 8, duration: 0.55 });
    // Clip the SVG as a whole: its original dashed stroke is never changed.
    add(t, root, '.hero-thread', 0.35, {
      y: 0,
      opacity: 1,
      clipPath: 'inset(0 100% 0 0)',
      duration: 0.95,
      clearProps: 'clip-path',
    });
  });
  if (conditions.small)
    each('.hero .feature-card', (t, root) => {
      t.from(root, {
        opacity: 0,
        y: 12,
        duration: 0.55,
        clearProps: 'opacity,transform',
      });
    });
  each('.values-strip', (t, root) => {
    gsap.set(root, {
      borderTopColor: 'transparent',
      borderBottomColor: 'transparent',
    });
    t.from(
      [line(root, 'top'), line(root, 'bottom')],
      { scaleX: 0, duration: 0.65, ease: 'power2.out' },
      0,
    );
    add(t, root, ':scope > span:not([data-motion-line])', 0.05, {
      y: 8,
      stagger: 0.06,
      duration: 0.5,
    });
  });
  each(
    '.collections .section-heading, .social .section-heading, .related-products',
    (t, root) => {
      add(t, root, '.eyebrow', 0, { y: 10 });
      add(t, root, 'h2', 0.09);
      add(t, root, '.section-heading > .button, .social-intro', 0.2, { y: 8 });
    },
  );
  all(document, '.product-card').forEach((card, index) =>
    entry(card, (t, root) => {
      const columns = conditions.small ? 2 : 4;
      const delay = (index % columns) * 0.08;
      // Card geometry and alternating heights stay untouched; its contents move.
      add(t, root, '.product-visual img', delay, { y: 24, duration: 0.7 });
      add(
        t,
        root,
        '.product-category, h3, .product-price, .image-note',
        delay + 0.12,
        { y: 8, stagger: 0.035, duration: 0.5 },
      );
    }),
  );
  each('.brand-statement', (t, root) => {
    add(t, root, '.statement-flower', 0, { y: 16 });
    add(t, root, '[data-statement-line]', 0.2, {
      y: 12,
      stagger: 0.12,
      duration: 0.56,
    });
    add(t, root, ':scope > p', 0.98, { y: 8, duration: 0.5 });
    add(t, root, '.statement-line', 1.05, {
      y: 0,
      opacity: 1,
      scaleX: 0,
      transformOrigin: 'center',
      duration: 0.6,
    });
    add(t, root, '.statement-star', 0.3, {
      y: 0,
      rotation: -18,
      duration: 0.7,
    });
  });
  each('.varieties-left', (t, root) => {
    add(t, root, '.eyebrow', 0, { y: 10 });
    add(t, root, 'h2', 0.08);
    add(t, root, '[data-variety]', 0.18, {
      y: 8,
      duration: 0.5,
      stagger: 0.055,
    });
  });
  each('.variety-panel', (t, root) => {
    add(t, root, '#variety-image', 0, { y: 18, duration: 0.7 });
    add(t, root, '.variety-description > div, #variety-link', 0.22, {
      y: 8,
      duration: 0.55,
      stagger: 0.08,
    });
  });
  each('.personalized-heading', (t, root) => {
    add(t, root, '.eyebrow', 0, { y: 8 });
    add(t, root, 'h2', 0.08);
    add(t, root, ':scope > div:last-child > *', 0.18, { y: 10, stagger: 0.1 });
  });
  each('.personalize-details', (t, root) => {
    gsap.set(root, { borderTopColor: 'transparent' });
    t.from(line(root, 'top'), { scaleX: 0, duration: 0.6 }, 0);
    add(t, root, 'summary', 0.12, { y: 8, duration: 0.5 });
  });
  each('.story-photo', (t, root) => {
    add(t, root, 'img', 0, { y: 0, scale: 1.03, duration: 0.8 });
    add(t, root, ':scope > span', 0.25, { y: 8 });
  });
  each('.story-copy', (t, root) => {
    add(t, root, '.eyebrow', 0, { y: 10 });
    add(t, root, 'h2', 0.1);
    add(t, root, '.story-definition', 0.3, { duration: 0.75 });
    add(
      t,
      root,
      ':scope > p:not(.eyebrow):not(.story-definition), .text-link',
      0.6,
      { y: 10, stagger: 0.1 },
    );
  });
  all(document, '.gallery-item').forEach((item, index) =>
    entry(item, (t, root) => {
      add(t, root, 'img, video', (index % (conditions.small ? 2 : 4)) * 0.09, {
        y: 20,
        duration: 0.7,
      });
      add(t, root, '.gallery-caption, figcaption, .gallery-number', 0.2, {
        y: 6,
        duration: 0.5,
      });
    }),
  );
  each('.order-steps', (t, root) => {
    add(t, root, ':scope > .eyebrow', 0, { y: 8 });
    add(t, root, ':scope > h2', 0.1);
  });
  all(document, '.steps-grid article').forEach((item, index) =>
    entry(item, (t, root) => {
      gsap.set(root, { borderTopColor: 'transparent' });
      t.from(
        line(root, 'top'),
        { scaleX: 0, duration: 0.5 },
        (index % (conditions.small ? 2 : 4)) * 0.1,
      );
      add(
        t,
        root,
        '.step-number, h3, p',
        0.12 + (index % (conditions.small ? 2 : 4)) * 0.1,
        { y: 8, stagger: 0.07, duration: 0.5 },
      );
    }),
  );
  each('.delivery-section', (t, root) => {
    t.from(root, { y: 16, duration: 0.6, clearProps: 'transform' }, 0);
    add(
      t,
      root,
      '.delivery-icon, .delivery-title > div, .delivery-content > p',
      0,
      { y: 8, stagger: 0.06, duration: 0.48 },
    );
    // The selector is never faded or disabled.
  });
  each('.faq > div:first-child', (t, root) =>
    add(t, root, ':scope > *', 0, { y: 8, stagger: 0.08, duration: 0.5 }),
  );
  all(document, '.faq summary').forEach((item, index) =>
    entry(item, (t, root) => {
      t.from(root, {
        opacity: 0,
        y: 6,
        delay: index * 0.035,
        duration: 0.5,
        clearProps: 'opacity,transform',
      });
    }),
  );
  each('.final-cta', (t, root) => {
    add(t, root, '.eyebrow', 0, { y: 8 });
    add(t, root, '[data-cta-line]', 0.12, { y: 16, stagger: 0.12 });
    add(t, root, 'div > p:not(.eyebrow), .button', 0.4, { y: 8, stagger: 0.1 });
  });
  all(document, '.footer-grid > div').forEach((item, index) =>
    entry(item, (t, root) => {
      t.from(root, {
        opacity: 0,
        y: 10,
        duration: 0.55,
        delay: (index % (conditions.small ? 2 : 5)) * 0.055,
        clearProps: 'opacity,transform',
      });
    }),
  );
  const cleanupWhatsApp = setupWhatsApp(!!reduced);

  // Interior pages reuse the same photographic and restrained reading motion.
  each('.page-intro', (t, root) => {
    if (
      document.querySelector('.legal-page') ||
      root.querySelector('.eyebrow')?.textContent?.includes('404 ·')
    ) {
      t.from(root, {
        opacity: 0,
        y: 8,
        duration: 0.5,
        clearProps: 'opacity,transform',
      });
    } else
      add(t, root, ':scope > *', 0, { y: 12, stagger: 0.09, duration: 0.6 });
  });
  each('.legal-page', (t, root) =>
    t.from(root, {
      opacity: 0,
      y: 8,
      duration: 0.5,
      clearProps: 'opacity,transform',
    }),
  );
  each('.detail-visual', (t, root) =>
    add(t, root, 'img', 0, { y: 20, duration: 0.75 }),
  );
  each('.detail-copy', (t, root) =>
    add(t, root, ':scope > *', 0.15, { y: 10, duration: 0.6, stagger: 0.07 }),
  );
  each('.story-manifesto', (t, root) =>
    add(t, root, ':scope > *', 0, { y: 10, duration: 0.7, stagger: 0.12 }),
  );
  each('.inspiration', (t, root) => {
    add(t, root, ':scope > img', 0, { y: 0, scale: 1.03, duration: 0.8 });
    add(t, root, ':scope > div > *', 0.18, { y: 10, stagger: 0.1 });
  });
  each('.form-page > .order-form > fieldset', (t, root) => {
    t.from(root, {
      opacity: 0,
      y: 8,
      duration: 0.5,
      clearProps: 'opacity,transform',
    });
  });

  if (!reduced && conditions.desktop) {
    const context = gsap.context(() => {
      const parallax = (
        selector: string,
        trigger: string,
        vars: gsap.TweenVars,
      ) => {
        if (!document.querySelector(selector)) return;
        gsap.to(selector, {
          ...vars,
          ease: 'none',
          scrollTrigger: {
            trigger,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
      };
      parallax('[data-hero-parallax]', '.hero', { y: 20 });
      // Animate object-position within the crop, without moving the arch itself.
      parallax('.story-photo img', '.story-photo', {
        objectPosition: '50% calc(50% + 20px)',
      });
      parallax('.cta-watermark', '.final-cta', { y: 16 });
    });
    contexts.push(context);
  }
  if (!reduced && conditions.hover) {
    const context = gsap.context(() => {}, document.body);
    contexts.push(context);
    all(document, '.product-card, .gallery-item').forEach((root) => {
      const image = root.querySelector('img');
      if (!image) return;
      const move = (active: boolean) =>
        context.add(() => {
          gsap.to(image, {
            scale: active ? 1.03 : 1,
            duration: 0.28,
            ease: 'power2.out',
            overwrite: 'auto',
          });
          const icon = root.querySelector('.gallery-caption svg');
          if (icon)
            gsap.to(icon, {
              rotation: active ? 12 : 0,
              duration: 0.25,
              overwrite: 'auto',
            });
        });
      root.addEventListener('pointerenter', () => move(true), {
        signal: listeners.signal,
      });
      root.addEventListener('pointerleave', () => move(false), {
        signal: listeners.signal,
      });
      root.addEventListener('focusin', () => move(true), {
        signal: listeners.signal,
      });
      root.addEventListener(
        'focusout',
        (event) => {
          if (!root.contains(event.relatedTarget as Node)) move(false);
        },
        { signal: listeners.signal },
      );
    });
  }
  document.addEventListener(
    'focusin',
    (event) => {
      running.forEach((timeline, root) => {
        if (root.contains(event.target as Node)) timeline.progress(1);
      });
    },
    { signal: listeners.signal, capture: true },
  );
  refresh();
  return () => {
    cleanupWhatsApp();
    listeners.abort();
    contexts.forEach((context) => context.revert());
    decorations.forEach((element) => element.remove());
  };
}
