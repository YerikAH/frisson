import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import { setupSections } from './motion-sections';

gsap.registerPlugin(ScrollTrigger, Flip);

/** One lifecycle for page motion; React owns the header's position separately. */
export function createMotion() {
  const context = gsap.context(() => {}, document.body);
  const media = gsap.matchMedia();
  const abort = new AbortController();
  const active = new Set<gsap.core.Animation>();
  let reduced = false;
  let disposed = false;
  let refreshFrame = 0;
  const refresh = () => {
    cancelAnimationFrame(refreshFrame);
    refreshFrame = requestAnimationFrame(() => {
      if (!disposed) ScrollTrigger.refresh();
    });
  };
  function animate(factory: () => gsap.core.Animation) {
    let animation!: gsap.core.Animation;
    context.add(() => {
      animation = factory();
      active.add(animation);
      const complete = animation.eventCallback('onComplete');
      const interrupt = animation.eventCallback('onInterrupt');
      animation.eventCallback('onComplete', () => {
        active.delete(animation);
        complete?.call(animation);
      });
      animation.eventCallback('onInterrupt', () => {
        active.delete(animation);
        interrupt?.call(animation);
      });
    });
    return animation;
  }
  media.add(
    {
      desktop: '(min-width: 64rem)',
      mobile: '(max-width: 63.999rem)',
      small: '(max-width: 39.999rem)',
      reduced: '(prefers-reduced-motion: reduce)',
      hover: '(hover: hover) and (pointer: fine)',
    },
    (scope) => {
      reduced = !!scope.conditions?.reduced;
      // Finish interrupted controls when the viewport or motion preference changes.
      [...active].forEach((animation) => animation.progress(1));
      return setupSections(scope.conditions || {}, refresh);
    },
  );

  const filterGroup = document.querySelector<HTMLElement>('.catalog-filters');
  const filterIndicator = filterGroup ? document.createElement('span') : null;
  let filterResize: ResizeObserver | undefined;
  function selectFilter(button: HTMLElement, immediate = false) {
    if (!filterGroup || !filterIndicator || !filterGroup.contains(button))
      return;
    const group = filterGroup.getBoundingClientRect();
    const target = button.getBoundingClientRect();
    const position = {
      x: target.left - group.left,
      y:
        target.bottom -
        group.top -
        parseFloat(getComputedStyle(button).borderBottomWidth),
      width: target.width,
    };
    if (immediate || reduced) {
      gsap.killTweensOf(filterIndicator);
      gsap.set(filterIndicator, position);
    } else {
      animate(() =>
        gsap.to(filterIndicator, {
          ...position,
          duration: 0.35,
          ease: 'power3.out',
          overwrite: true,
        }),
      );
    }
  }
  const alignFilterIndicator = () => {
    const selected = filterGroup?.querySelector<HTMLElement>(
      '[data-filter][aria-pressed="true"]',
    );
    if (!disposed && selected) selectFilter(selected, true);
  };
  if (filterGroup && filterIndicator) {
    filterIndicator.className =
      'catalog-filter-indicator pointer-events-none absolute top-0 left-0 h-0.5 bg-accent';
    filterIndicator.setAttribute('aria-hidden', 'true');
    filterGroup.append(filterIndicator);
    alignFilterIndicator();
    // Conservar el borde nativo hasta que el indicador esté colocado.
    filterGroup.dataset.filterIndicator = '';
    filterResize = new ResizeObserver(alignFilterIndicator);
    filterResize.observe(filterGroup);
    filterGroup
      .querySelectorAll('[data-filter]')
      .forEach((button) => filterResize!.observe(button));
    document.fonts.ready.then(alignFilterIndicator);
  }

  const dialogs = new Map<HTMLDialogElement, HTMLElement | null>();
  const dialogTweens = new Map<HTMLDialogElement, gsap.core.Animation>();
  const resetDialog = (dialog: HTMLDialogElement) => {
    gsap.set(dialog, { clearProps: 'opacity,transform,--backdrop-opacity' });
    dialog.removeAttribute('data-closing');
  };
  function openDialog(dialog: HTMLDialogElement) {
    dialogTweens.get(dialog)?.kill();
    dialog.removeAttribute('data-closing');
    if (!dialog.open) {
      dialogs.set(dialog, document.activeElement as HTMLElement | null);
      dialog.showModal();
    }
    if (reduced) {
      resetDialog(dialog);
      return;
    }
    const drawer = dialog.id === 'cart-dialog';
    const small = matchMedia('(max-width: 39.999rem)').matches;
    dialogTweens.set(
      dialog,
      animate(() =>
        gsap.fromTo(
          dialog,
          {
            opacity: drawer ? 1 : 0,
            xPercent: drawer && !small ? 100 : 0,
            yPercent: drawer && small ? 100 : 0,
            y: drawer ? 0 : 12,
            scale: drawer ? 1 : 0.99,
            '--backdrop-opacity': 0,
          },
          {
            opacity: 1,
            xPercent: 0,
            yPercent: 0,
            y: 0,
            scale: 1,
            '--backdrop-opacity': 0.4,
            duration: 0.28,
            ease: 'power3.out',
            onComplete: () => resetDialog(dialog),
          },
        ),
      ),
    );
  }
  function closeDialog(dialog: HTMLDialogElement) {
    if (!dialog.open || dialog.hasAttribute('data-closing')) return;
    dialogTweens.get(dialog)?.kill();
    dialog.setAttribute('data-closing', '');
    const finish = () => {
      dialog.close();
      resetDialog(dialog);
      const opener = dialogs.get(dialog);
      if (opener?.isConnected && !document.querySelector('dialog[open]'))
        opener.focus({ preventScroll: true });
    };
    if (reduced) {
      finish();
      return;
    }
    const drawer = dialog.id === 'cart-dialog';
    const small = matchMedia('(max-width: 39.999rem)').matches;
    dialogTweens.set(
      dialog,
      animate(() =>
        gsap.to(dialog, {
          opacity: drawer ? 1 : 0,
          xPercent: drawer && !small ? 100 : 0,
          yPercent: drawer && small ? 100 : 0,
          y: drawer ? 0 : 12,
          '--backdrop-opacity': 0,
          duration: 0.2,
          ease: 'power2.in',
          onComplete: finish,
        }),
      ),
    );
  }
  document
    .querySelectorAll<HTMLDialogElement>('dialog:not(#mobile-menu)')
    .forEach((dialog) => {
      // A search input may consume Escape to clear itself before native cancel.
      dialog.addEventListener(
        'keydown',
        (event) => {
          if (event.key !== 'Escape') return;
          event.preventDefault();
          event.stopPropagation();
          closeDialog(dialog);
        },
        { signal: abort.signal },
      );
      dialog.addEventListener(
        'cancel',
        (event) => {
          event.preventDefault();
          closeDialog(dialog);
        },
        { signal: abort.signal },
      );
    });

  let menuTween: gsap.core.Animation | undefined;
  function menu(panel: HTMLDialogElement, open: boolean) {
    const fresh = !panel.open;
    menuTween?.kill();
    menuTween = undefined;
    panel.inert = !open;
    const brand = panel.querySelector('.mobile-menu-brand');
    const text = panel.querySelectorAll('[data-menu-text]');
    const indexes = panel.querySelectorAll('[data-menu-index]');
    const lines = panel.querySelectorAll('[data-menu-line]');
    const footer = panel.querySelector('.mobile-menu-footer');
    const targets = [panel, brand, ...text, ...indexes, ...lines, footer];
    const finish = () => {
      if (!open) {
        panel.close();
        panel.inert = false;
      }
      gsap.set(targets, {
        clearProps: 'opacity,transform,clip-path,--backdrop-opacity',
      });
      refresh();
    };
    if (open && fresh) {
      panel.showModal();
      panel.scrollTop = 0;
    }
    if (reduced || (!open && fresh)) {
      finish();
      return;
    }
    menuTween = animate(() => {
      const timeline = gsap.timeline({ onComplete: finish });
      if (open) {
        if (fresh) {
          gsap.set(panel, {
            clipPath: 'inset(0 0 100% 0)',
            '--backdrop-opacity': 0,
          });
          gsap.set([brand, footer], { opacity: 0, y: 10 });
          gsap.set(text, { opacity: 0, y: 22 });
          gsap.set(indexes, { opacity: 0 });
          gsap.set(lines, { scaleX: 0 });
        }
        timeline
          .to(
            panel,
            {
              clipPath: 'inset(0 0 0% 0)',
              '--backdrop-opacity': 0.4,
              duration: 0.55,
              ease: 'power3.inOut',
            },
            0,
          )
          .to(
            brand,
            { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
            0.12,
          )
          .to(
            text,
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.055,
              ease: 'power3.out',
            },
            0.18,
          )
          .to(
            indexes,
            { opacity: 1, duration: 0.35, stagger: 0.055, ease: 'power2.out' },
            0.2,
          )
          .to(
            lines,
            { scaleX: 1, duration: 0.5, stagger: 0.045, ease: 'power2.out' },
            0.18,
          )
          .to(
            footer,
            { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
            0.42,
          );
      } else {
        timeline
          .to(
            [brand, ...text, ...indexes, footer],
            { opacity: 0, duration: 0.18, ease: 'power2.out' },
            0,
          )
          .to(
            panel,
            {
              clipPath: 'inset(0 0 100% 0)',
              '--backdrop-opacity': 0,
              duration: 0.32,
              ease: 'power2.inOut',
            },
            0.06,
          );
      }
      return timeline;
    });
  }
  document.querySelector('#mobile-menu')?.addEventListener(
    'focusin',
    (event) => {
      if (
        (event.target as HTMLElement).closest('a') &&
        document
          .querySelector('.menu-toggle')
          ?.getAttribute('aria-expanded') === 'true'
      )
        menuTween?.progress(1);
    },
    { signal: abort.signal },
  );

  // Keep details/summary native, including keyboard activation and independent panels.
  document
    .querySelectorAll<HTMLDetailsElement>('.faq details, .personalize-details')
    .forEach((details) => {
      const summary = details.querySelector('summary')!;
      const body = details.querySelector<HTMLElement>('[data-details-body]')!;
      const icon = summary.querySelector('svg');
      let wanted = details.open;
      let tween: gsap.core.Animation | undefined;
      summary.addEventListener(
        'click',
        (event) => {
          event.preventDefault();
          wanted = !wanted;
          const height = details.open ? body.getBoundingClientRect().height : 0;
          tween?.kill();
          if (!wanted && body.contains(document.activeElement)) summary.focus();
          body.inert = !wanted;
          summary.setAttribute('aria-expanded', String(wanted));
          details.open = true;
          const finish = () => {
            details.open = wanted;
            gsap.set(body, { clearProps: 'height,opacity,overflow' });
            const fields = body.querySelectorAll('fieldset');
            if (fields.length) gsap.set(fields, { clearProps: 'opacity' });
            refresh();
          };
          if (reduced) {
            if (icon) gsap.set(icon, { rotation: wanted ? 45 : 0 });
            finish();
            return;
          }
          tween = animate(() => {
            const timeline = gsap
              .timeline({ onComplete: finish })
              .fromTo(
                body,
                { height, overflow: 'hidden' },
                {
                  height: wanted ? body.scrollHeight : 0,
                  opacity: wanted ? 1 : 0,
                  duration: details.classList.contains('personalize-details')
                    ? 0.35
                    : 0.28,
                  ease: 'power2.out',
                  onUpdate: () => ScrollTrigger.update(),
                },
              )
              .to(
                icon,
                {
                  rotation: wanted ? 45 : 0,
                  duration: 0.25,
                  ease: 'power2.out',
                },
                0,
              );
            const fields = body.querySelectorAll('fieldset');
            if (wanted && fields.length)
              timeline.fromTo(
                fields,
                { opacity: 0 },
                {
                  opacity: 1,
                  duration: 0.18,
                  stagger: 0.025,
                  clearProps: 'opacity',
                },
                0.04,
              );
            return timeline;
          });
        },
        { signal: abort.signal },
      );
      body.addEventListener(
        'focusin',
        () => {
          if (wanted && tween?.isActive()) tween.progress(1);
        },
        { signal: abort.signal },
      );
      details.addEventListener(
        'toggle',
        () => {
          if (!tween?.isActive()) {
            wanted = details.open;
            body.inert = !wanted;
            summary.setAttribute('aria-expanded', String(wanted));
          }
          refresh();
        },
        { signal: abort.signal },
      );
    });

  function feedback(targets: HTMLElement | HTMLElement[]) {
    if (reduced) return;
    animate(() =>
      gsap.fromTo(
        targets,
        { scale: 0.97 },
        {
          scale: 1,
          duration: 0.24,
          ease: 'power2.out',
          overwrite: true,
          clearProps: 'transform',
        },
      ),
    );
  }
  function fade(targets: HTMLElement | HTMLElement[], entering = true) {
    if (reduced) {
      gsap.set(targets, { clearProps: 'opacity' });
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      gsap.killTweensOf(targets);
      animate(() =>
        entering
          ? gsap.fromTo(
              targets,
              { opacity: 0 },
              {
                opacity: 1,
                duration: 0.24,
                overwrite: true,
                clearProps: 'opacity',
                onComplete: resolve,
                onInterrupt: resolve,
              },
            )
          : gsap.to(targets, {
              opacity: 0,
              duration: 0.16,
              overwrite: true,
              onComplete: resolve,
              onInterrupt: resolve,
            }),
      );
    });
  }
  function filter(cards: HTMLElement[], update: () => void) {
    // Finish entrance transforms before Flip measures; rapid filters start from a valid layout.
    Flip.killFlipsOf(cards, true);
    gsap.killTweensOf(cards);
    gsap.set(cards, { clearProps: 'transform,opacity' });
    const state = reduced ? null : Flip.getState(cards);
    update();
    if (state)
      animate(() =>
        Flip.from(state, {
          duration: 0.5,
          ease: 'power3.out',
          prune: true,
          onEnter: (elements) =>
            gsap.fromTo(
              elements,
              { opacity: 0 },
              { opacity: 1, duration: 0.25, clearProps: 'opacity' },
            ),
          onComplete: refresh,
        }),
      );
    refresh();
  }
  function removeRow(row: HTMLElement) {
    row.inert = true;
    row.removeAttribute('data-cart-id');
    const finish = () => {
      row.remove();
      refresh();
    };
    if (reduced || !row.checkVisibility()) {
      finish();
      return;
    }
    animate(() =>
      gsap.to(row, {
        opacity: 0,
        height: 0,
        paddingTop: 0,
        paddingBottom: 0,
        overflow: 'hidden',
        duration: 0.2,
        onComplete: finish,
      }),
    );
  }

  document.fonts.ready.then(refresh);
  document.querySelectorAll('img').forEach((image) => {
    if (!image.complete)
      image.addEventListener('load', refresh, {
        once: true,
        signal: abort.signal,
      });
  });
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    abort.abort();
    cancelAnimationFrame(refreshFrame);
    [...active].forEach((animation) => animation.progress(1));
    filterResize?.disconnect();
    filterIndicator?.remove();
    if (filterGroup) delete filterGroup.dataset.filterIndicator;
    media.revert();
    context.revert();
  };
  return {
    openDialog,
    closeDialog,
    menu,
    feedback,
    fade,
    filter,
    selectFilter,
    removeRow,
    refresh,
    cleanup,
  };
}
