import { gsap } from 'gsap';

/** Línea compartida para los enlaces del header, independiente de su desplazamiento. */
export function createHeaderIndicator(root: HTMLElement) {
  const header = root.querySelector<HTMLElement>('.header');
  if (!header) return () => {};
  const links = [
    ...header.querySelectorAll<HTMLAnchorElement>('.nav-left a, .history-link'),
  ];
  const indicator = document.createElement('span');
  indicator.className =
    'header-link-indicator pointer-events-none absolute top-0 left-0 h-0.5 bg-ink max-lg:hidden';
  indicator.setAttribute('aria-hidden', 'true');
  header.append(indicator);
  const context = gsap.context(() => {}, indicator);
  const media = gsap.matchMedia();
  const listeners = new AbortController();
  let hovered: HTMLAnchorElement | undefined;
  let reduced = false;
  let positioned = false;
  let disposed = false;

  function align(immediate = false) {
    if (disposed) return;
    const target = [
      hovered,
      links.find(
        (link) =>
          link === document.activeElement && link.matches(':focus-visible'),
      ),
      links.find(
        (link) =>
          link.hasAttribute('aria-current') ||
          link.classList.contains('active'),
      ),
    ].find((link) => link?.checkVisibility());
    context.add(() => {
      if (!target) {
        gsap.to(indicator, {
          opacity: 0,
          duration: reduced || immediate ? 0 : 0.18,
          overwrite: true,
        });
        return;
      }
      let x = 0;
      let y = 0;
      let parent: HTMLElement | null = target;
      // Medir el layout evita heredar la entrada animada de cada enlace.
      while (parent && parent !== header) {
        x += parent.offsetLeft;
        y += parent.offsetTop;
        parent = parent.offsetParent as HTMLElement | null;
      }
      const bottom =
        parseFloat(getComputedStyle(target, '::after').bottom) || 0;
      gsap.to(indicator, {
        x,
        y: y + target.offsetHeight - bottom - indicator.offsetHeight,
        width: target.getBoundingClientRect().width,
        opacity: 1,
        duration: reduced || immediate || !positioned ? 0 : 0.35,
        ease: 'power3.out',
        overwrite: true,
      });
      positioned = true;
    });
  }
  links.forEach((link) => {
    link.addEventListener(
      'pointerenter',
      (event) => {
        if (event.pointerType === 'touch') return;
        hovered = link;
        align();
      },
      { signal: listeners.signal },
    );
    link.addEventListener(
      'pointerleave',
      () => {
        hovered = undefined;
        align();
      },
      { signal: listeners.signal },
    );
    link.addEventListener('focus', () => align(), { signal: listeners.signal });
    link.addEventListener('blur', () => align(), { signal: listeners.signal });
  });
  const selected = new MutationObserver(() => align());
  links.forEach((link) =>
    selected.observe(link, {
      attributes: true,
      attributeFilter: ['aria-current', 'class'],
    }),
  );
  const resize = new ResizeObserver(() => align(true));
  resize.observe(header);
  links.forEach((link) => resize.observe(link));
  media.add(
    {
      reduced: '(prefers-reduced-motion: reduce)',
      normal: '(prefers-reduced-motion: no-preference)',
    },
    (scope) => {
      reduced = !!scope.conditions?.reduced;
      align(true);
    },
  );
  header.dataset.navIndicator = '';
  document.fonts.ready.then(() => align(true));
  return () => {
    disposed = true;
    listeners.abort();
    selected.disconnect();
    resize.disconnect();
    media.revert();
    context.revert();
    indicator.remove();
    delete header.dataset.navIndicator;
  };
}
