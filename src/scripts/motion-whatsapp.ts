import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const presented = new WeakSet<HTMLElement>();

/** Reveal the floating contact only after the first two main sections. */
export function setupWhatsApp(reduced: boolean) {
  const button = document.querySelector<HTMLElement>('.whatsapp-float');
  const sections = document.querySelectorAll<HTMLElement>(
    '#contenido > section, #contenido > article',
  );
  const boundary = sections[1] || sections[0];
  if (!button || !boundary) return () => {};

  const context = gsap.context(() => {}, button);
  let appearance: gsap.core.Tween | undefined;
  let focusFrame = 0;
  const update = () => {
    // Keep a focused control available until the user moves focus away.
    const visible =
      boundary.getBoundingClientRect().bottom <= 1 ||
      button.contains(document.activeElement);
    if (visible === !button.hidden) return;
    button.hidden = !visible;
    context.add(() => {
      appearance?.kill();
      gsap.set(button, { clearProps: 'opacity,transform' });
      if (!visible || presented.has(button)) return;
      presented.add(button);
      if (!reduced)
        appearance = gsap.fromTo(
          button,
          { opacity: 0, scale: 0.96 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: 'power2.out',
            clearProps: 'opacity,transform',
          },
        );
    });
  };
  const onBlur = () => {
    cancelAnimationFrame(focusFrame);
    focusFrame = requestAnimationFrame(update);
  };
  context.add(() => {
    ScrollTrigger.create({
      trigger: boundary,
      start: 'bottom top',
      end: 'max',
      onEnter: update,
      onLeaveBack: update,
      onRefresh: update,
    });
    update();
  });
  button.addEventListener('blur', onBlur);
  return () => {
    cancelAnimationFrame(focusFrame);
    button.removeEventListener('blur', onBlur);
    context.revert();
    button.hidden = true;
  };
}
