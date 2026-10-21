import { createMotion } from './motion';
import { products, priceLabel } from '../data/products';
import { site } from '../config/site';
import {
  sanitizeCart,
  deliveryMessage,
  buildOrderMessage,
  whatsappUrl,
  type CartItem,
} from '../lib/orders';

const $ = <T extends HTMLElement>(selector: string) =>
  document.querySelector<T>(selector);
const $$ = <T extends HTMLElement>(selector: string) => [
  ...document.querySelectorAll<T>(selector),
];
const cartKey = 'frisson-selection-v1';
const draftKey = 'frisson-request-v1';
let cart: CartItem[] = [];
try {
  cart = sanitizeCart(
    JSON.parse(localStorage.getItem(cartKey) || '[]'),
    products,
  );
} catch {
  /* La selección sigue disponible en memoria. */
}
let motion: ReturnType<typeof createMotion> | undefined;
function startMotion() {
  try {
    motion = createMotion();
  } catch (error) {
    console.error('No se pudo iniciar el movimiento de Frisson.', error);
  }
}
if (document.documentElement.dataset.brandIntro === 'active') {
  window.addEventListener('frisson:intro-reveal', startMotion, { once: true });
} else startMotion();
let toastTimer: ReturnType<typeof setTimeout>;
function toast(message: string) {
  const el = $('.toast');
  if (!el) return;
  clearTimeout(toastTimer);
  el.textContent = message;
  el.hidden = false;
  void motion?.fade(el);
  toastTimer = setTimeout(() => {
    el.hidden = true;
  }, 3500);
}
function saveCart() {
  try {
    localStorage.setItem(cartKey, JSON.stringify(cart));
  } catch {
    toast('Tu selección se conservará mientras permanezcas en esta página.');
  }
  renderCart();
}
function closeDialog(dialog: HTMLDialogElement) {
  if (motion) motion.closeDialog(dialog);
  else dialog.close();
}
function openDialog(id: string) {
  const dialog = $<HTMLDialogElement>(`#${id}`);
  if (dialog) {
    if (motion) motion.openDialog(dialog);
    else if (!dialog.open) dialog.showModal();
  }
}
$$<HTMLDialogElement>('dialog:not(#mobile-menu)').forEach((dialog) => {
  dialog
    .querySelectorAll('[data-close-dialog]')
    .forEach((button) =>
      button.addEventListener('click', () => closeDialog(dialog)),
    );
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (
      event.clientX < r.left ||
      event.clientX > r.right ||
      event.clientY < r.top ||
      event.clientY > r.bottom
    )
      closeDialog(dialog);
  });
});
function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}
function icon(name: 'arrow' | 'up-right') {
  return $<HTMLTemplateElement>(`#ui-icon-${name}`)!
    .content.querySelector('svg')!
    .cloneNode(true);
}
function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  $$('.cart-count').forEach((el) => {
    el.textContent = String(count);
    el.hidden = count === 0;
  });
  $$('[data-open-cart]').forEach((el) =>
    el.setAttribute(
      'aria-label',
      `Abrir mi selección${count ? `, ${count} ${count === 1 ? 'arreglo' : 'arreglos'}` : ''}`,
    ),
  );
  ['#cart-items', '#page-order-items'].forEach((selector) => {
    const container = $(selector);
    if (!container) return;
    const rows = [...container.querySelectorAll<HTMLElement>('[data-cart-id]')];
    const existing = new Map(rows.map((row) => [row.dataset.cartId, row]));
    container.querySelector('.cart-empty')?.remove();
    rows.forEach((row, index) => {
      if (cart.some((item) => item.id === row.dataset.cartId)) return;
      if (row.contains(document.activeElement)) {
        const neighbor =
          rows
            .slice(index + 1)
            .find((r) => cart.some((item) => item.id === r.dataset.cartId)) ||
          rows
            .slice(0, index)
            .reverse()
            .find((r) => cart.some((item) => item.id === r.dataset.cartId));
        (
          neighbor?.querySelector<HTMLElement>('button') ||
          container
            .closest('dialog, aside')
            ?.querySelector<HTMLElement>('a, button')
        )?.focus({ preventScroll: true });
      }
      if (motion) motion.removeRow(row);
      else row.remove();
    });
    if (!cart.length) {
      const empty = element(
        'div',
        'cart-empty py-14 px-0 text-center font-serif text-2xl [&_p]:font-sans [&_p]:text-xs [&_p]:text-muted [&_p]:mt-4',
        'Tu próximo gesto empieza aquí.',
      );
      empty.append(
        element(
          'p',
          undefined,
          'Explora la colección o crea un arreglo a tu manera.',
        ),
      );
      const link = element(
        'a',
        'button py-3 px-7 border border-solid border-ink gap-6 inline-flex justify-center items-center min-h-12 rounded-full bg-paper bg-none text-xs font-medium leading-normal transition duration-300 ease-out whitespace-nowrap [&:hover]:bg-ink [&:hover]:bg-none [&:hover]:text-paper [&:hover]:-translate-y-0.5 max-sm:px-6 max-sm:min-h-11 max-sm:text-xs',
        'Descubrir la colección',
      );
      link.href = '/catalogo';
      empty.append(link);
      container.append(empty);
      return;
    }
    cart.forEach((item) => {
      const current = existing.get(item.id);
      if (current) {
        const quantity = current.querySelector<HTMLElement>('[data-quantity]')!;
        quantity.textContent = String(item.quantity);
        quantity.setAttribute(
          'aria-label',
          `${item.quantity} ${item.quantity === 1 ? 'arreglo' : 'arreglos'}`,
        );
        current.querySelector<HTMLButtonElement>('[data-increment]')!.disabled =
          item.quantity >= 99;
        return;
      }
      const product = products.find((p) => p.id === item.id)!;
      const row = element(
        'article',
        'cart-row py-5 px-0 gap-5 grid grid-cols-[auto_1fr] items-center [&_img]:w-20 [&_img]:h-28 [&_img]:object-cover [&_img]:object-center [&_img]:bg-pale [&_img]:bg-none [&_img]:rounded-full [&_h3]:mx-0 [&_h3]:text-2xl [&_h3]:leading-tight [&_h3]:mt-0 [&_h3]:mb-1.5 [&_p]:text-xs [&_p]:mb-2.5 [&_p]:text-muted max-sm:[&_h3]:text-2xl max-sm:gap-4',
      );
      row.dataset.cartId = item.id;
      const img = element('img');
      img.src = `/images/${product.image}.webp`;
      img.alt = product.alt;
      img.width = 80;
      img.height = 112;
      const content = element('div');
      const title = element('h3');
      const link = element('a', undefined, product.name);
      link.href = `/catalogo/${product.id}`;
      title.append(link);
      content.append(title, element('p', undefined, priceLabel(product.price)));
      const controls = element(
        'div',
        'quantity-controls gap-3 flex items-center text-xs [&_button]:border [&_button]:border-solid [&_button]:border-line [&_button]:rounded-full [&_button]:w-9 [&_button]:h-9 [&_.remove-product]:border-0 [&_.remove-product]:border-solid [&_.remove-product]:border-current [&_.remove-product]:rounded-none [&_.remove-product]:ml-auto [&_.remove-product]:w-auto [&_.remove-product]:underline [&_.remove-product]:text-xs max-lg:gap-2 max-lg:flex-wrap',
      );
      const minus = element('button', undefined, '−');
      minus.type = 'button';
      minus.setAttribute('aria-label', `Reducir cantidad de ${product.name}`);
      minus.addEventListener('click', () => changeQuantity(item.id, -1));
      const quantity = element('span', undefined, String(item.quantity));
      quantity.dataset.quantity = '';
      quantity.setAttribute(
        'aria-label',
        `${item.quantity} ${item.quantity === 1 ? 'arreglo' : 'arreglos'}`,
      );
      const plus = element('button', undefined, '+');
      plus.type = 'button';
      plus.dataset.increment = '';
      plus.setAttribute('aria-label', `Aumentar cantidad de ${product.name}`);
      plus.disabled = item.quantity >= 99;
      plus.addEventListener('click', () => changeQuantity(item.id, 1));
      const remove = element('button', 'remove-product', 'Quitar');
      remove.type = 'button';
      remove.setAttribute('aria-label', `Quitar ${product.name}`);
      remove.addEventListener('click', () => {
        cart = cart.filter((c) => c.id !== item.id);
        saveCart();
        toast(`${product.name} se quitó de tu selección.`);
      });
      controls.append(minus, quantity, plus, remove);
      content.append(controls);
      row.append(img, content);
      container.append(row);
      if (row.checkVisibility()) void motion?.fade(row);
    });
  });
  const next = $<HTMLAnchorElement>('#cart-continue');
  if (next) {
    next.querySelector('[data-cart-continue-label]')!.textContent = count
      ? 'Preparar mi solicitud'
      : 'Crear un arreglo personalizado';
    next.href = count ? '/pedido' : '/personalizados';
  }
}
function changeQuantity(id: string, amount: number) {
  const item = cart.find((c) => c.id === id);
  if (!item) return;
  item.quantity += amount;
  cart = cart.filter((c) => c.quantity > 0);
  saveCart();
}
renderCart();
$$('[data-add-product]').forEach((button) =>
  button.addEventListener('click', () => {
    const id = button.dataset.addProduct!;
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const item = cart.find((c) => c.id === id);
    if (item) item.quantity = Math.min(99, item.quantity + 1);
    else cart.push({ id, quantity: 1 });
    saveCart();
    motion?.feedback([button, ...$$('.cart-count')]);
    toast(`${product.name} se añadió a tu selección.`);
  }),
);
$$('[data-open-cart]').forEach((button) =>
  button.addEventListener('click', () => openDialog('cart-dialog')),
);
window.addEventListener('storage', (event) => {
  if (event.key !== cartKey) return;
  try {
    cart = sanitizeCart(JSON.parse(event.newValue || '[]'), products);
    renderCart();
  } catch {
    /* Se conserva la selección válida actual. */
  }
});

const menuButton = $<HTMLButtonElement>('.menu-toggle');
const mobileMenu = $<HTMLDialogElement>('#mobile-menu');
let menuAnchor: HTMLElement | null = null;
function syncMenuClosed() {
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Abrir menú');
}
function setMenu(open: boolean) {
  if (!mobileMenu) return;
  if (open) menuAnchor = null;
  menuButton?.setAttribute('aria-expanded', String(open));
  menuButton?.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  if (motion) motion.menu(mobileMenu, open);
  else if (open && !mobileMenu.open) mobileMenu.showModal();
  else if (!open) mobileMenu.close();
}
function hideMenu() {
  setMenu(false);
}
menuButton?.addEventListener('click', () =>
  setMenu(menuButton.getAttribute('aria-expanded') !== 'true'),
);
mobileMenu
  ?.querySelector('[data-close-menu]')
  ?.addEventListener('click', hideMenu);
mobileMenu?.querySelectorAll('a').forEach((link) =>
  link.addEventListener('click', () => {
    const target = new URL(link.href);
    if (
      target.origin === location.origin &&
      target.pathname === location.pathname &&
      target.hash
    )
      menuAnchor = document.getElementById(
        decodeURIComponent(target.hash.slice(1)),
      );
    hideMenu();
  }),
);
mobileMenu?.addEventListener('cancel', (event) => {
  event.preventDefault();
  hideMenu();
});
mobileMenu?.addEventListener('keydown', (event) => {
  if (event.key !== 'Tab' || mobileMenu.inert) return;
  const controls = [
    ...mobileMenu.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])',
    ),
  ];
  const first = controls[0];
  const last = controls.at(-1);
  if (
    (!event.shiftKey && document.activeElement === last) ||
    (event.shiftKey && document.activeElement === first)
  ) {
    event.preventDefault();
    (event.shiftKey ? last : first)?.focus();
  }
});
mobileMenu?.addEventListener('close', () => {
  // An interrupted closing animation may have been followed by a fresh opening.
  if (mobileMenu.open) return;
  syncMenuClosed();
  mobileMenu.inert = false;
  if (menuButton?.checkVisibility()) menuButton.focus({ preventScroll: true });
  const anchor = menuAnchor;
  menuAnchor = null;
  if (anchor)
    requestAnimationFrame(() => anchor.scrollIntoView({ block: 'start' }));
});
matchMedia('(min-width:64rem)').addEventListener('change', (event) => {
  if (event.matches) hideMenu();
});

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
function renderSearch() {
  const term = normalize(
    $<HTMLInputElement>('#search-input')?.value.trim() || '',
  );
  const results = $('#search-results');
  if (!results) return;
  results.replaceChildren();
  const matches = products.filter((p) =>
    normalize(`${p.name} ${p.category} ${p.flowers} ${p.colors}`).includes(
      term,
    ),
  );
  if (!matches.length) {
    results.append(
      element(
        'p',
        'search-empty py-6 text-sm',
        'No encontramos esa flor. Puedes contarnos tu idea en una creación personalizada.',
      ),
    );
    const link = element(
      'a',
      'text-link gap-4 inline-flex items-center min-h-10 text-sm font-medium border-b border-solid border-b-line transition-all duration-200 [&:hover]:border-ink [&:hover]:gap-6',
      'Crear mi arreglo',
    );
    link.href = '/personalizados';
    link.append(icon('arrow'));
    results.append(link);
    return;
  }
  matches.forEach((p) => {
    const link = element(
      'a',
      'search-result py-4 px-0 gap-5 grid grid-cols-[auto_1fr_auto] items-center border-b border-solid border-b-line [&_img]:w-16 [&_img]:h-20 [&_img]:object-cover [&_img]:object-center [&_img]:bg-pale [&_img]:bg-none [&_img]:rounded-full [&_h3]:m-0 [&_h3]:text-2xl [&_p]:mx-0 [&_p]:text-xs [&_p]:text-muted [&_p]:mt-1 [&_p]:mb-0 max-sm:gap-3 max-sm:grid-cols-[auto_1fr_auto] max-sm:[&_img]:w-14 max-sm:[&_img]:h-16 max-sm:[&_h3]:text-2xl max-sm:[&_p]:text-xs',
    );
    link.href = `/catalogo/${p.id}`;
    const img = element('img');
    img.src = `/images/${p.image}.webp`;
    img.alt = '';
    img.width = 64;
    img.height = 80;
    const copy = element('div');
    copy.append(
      element('h3', undefined, p.name),
      element('p', undefined, p.category),
    );
    link.append(img, copy, icon('up-right'));
    results.append(link);
  });
}
$$('[data-open-search]').forEach((button) =>
  button.addEventListener('click', () => {
    openDialog('search-dialog');
    renderSearch();
    $<HTMLInputElement>('#search-input')?.focus();
  }),
);
$('#search-input')?.addEventListener('input', renderSearch);
$$<HTMLButtonElement>('[data-filter]').forEach((button) =>
  button.addEventListener('click', () => {
    const category = button.dataset.filter;
    $$('[data-filter]').forEach((b) =>
      b.setAttribute('aria-pressed', String(b === button)),
    );
    motion?.selectFilter(button);
    let count = 0;
    const cards = $$('.catalog-grid .product-card');
    const update = () =>
      cards.forEach((card) => {
        card.hidden =
          category !== 'Todas' && card.dataset.category !== category;
        if (!card.hidden) count++;
      });
    if (motion) motion.filter(cards, update);
    else update();
    const label = $('#catalog-count');
    if (label)
      label.textContent = `${count} ${count === 1 ? 'COMPOSICIÓN' : 'COMPOSICIONES'} PARA INSPIRARTE`;
  }),
);

const varietyTabs = $$<HTMLButtonElement>('[data-variety]');
let varietyVersion = 0;
let currentVariety = varietyTabs[0];
function markVariety(button: HTMLButtonElement) {
  varietyTabs.forEach((tab) => {
    tab.setAttribute('aria-selected', String(tab === button));
    tab.tabIndex = tab === button ? 0 : -1;
  });
}
// Reserve the longest description at the current width, without changing visible copy.
function sizeVarietyDescription() {
  const copy = $('#variety-text');
  if (!copy) return;
  const measure = copy.cloneNode(true) as HTMLElement;
  measure.removeAttribute('id');
  measure.setAttribute('aria-hidden', 'true');
  Object.assign(measure.style, {
    position: 'absolute',
    visibility: 'hidden',
    width: `${copy.clientWidth}px`,
    minHeight: '0',
    pointerEvents: 'none',
  });
  copy.parentElement?.append(measure);
  let height = 0;
  varietyTabs.forEach((tab) => {
    measure.textContent = JSON.parse(tab.dataset.variety!).text;
    height = Math.max(height, measure.getBoundingClientRect().height);
  });
  measure.remove();
  copy.style.minHeight = `${height}px`;
  motion?.refresh();
}
sizeVarietyDescription();
document.fonts.ready.then(sizeVarietyDescription);
window.addEventListener('resize', sizeVarietyDescription);
async function selectVariety(button: HTMLButtonElement) {
  const version = ++varietyVersion;
  const data = JSON.parse(button.dataset.variety!);
  const panel = $('#variety-panel');
  const img = $<HTMLImageElement>('#variety-image');
  const description = $('.variety-description');
  if (!panel || !img || !description) return;
  const targets = [img, description];
  markVariety(button);
  panel.setAttribute('aria-busy', 'true');
  const nextImage = new Image();
  nextImage.src = `/images/${data.image}.webp`;
  try {
    await Promise.all([nextImage.decode(), motion?.fade(targets, false)]);
    if (version !== varietyVersion) return;
    // One synchronous commit: photograph, copy, price and destination always agree.
    img.src = nextImage.src;
    img.alt = data.alt;
    img.classList.toggle('variety-photo', !!data.sourceUrl);
    $('#variety-price')!.textContent =
      priceLabel(data.price) + ' · Disponibilidad a coordinar';
    $('#variety-text')!.textContent = data.text;
    $<HTMLAnchorElement>('#variety-link')!.href =
      `/personalizados?tipo=${encodeURIComponent(data.type)}`;
    panel.setAttribute('aria-labelledby', button.id);
    currentVariety = button;
  } catch {
    if (version !== varietyVersion) return;
    markVariety(currentVariety);
    toast('No pudimos cargar esta fotografía. Inténtalo de nuevo.');
  }
  if (version !== varietyVersion) return;
  panel.removeAttribute('aria-busy');
  void motion?.fade(targets);
  motion?.refresh();
}
varietyTabs.forEach((button, index) => {
  button.addEventListener('click', () => selectVariety(button));
  button.addEventListener('keydown', (event) => {
    let next = index;
    if (['ArrowDown', 'ArrowRight'].includes(event.key))
      next = (index + 1) % varietyTabs.length;
    else if (['ArrowUp', 'ArrowLeft'].includes(event.key))
      next = (index - 1 + varietyTabs.length) % varietyTabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = varietyTabs.length - 1;
    else return;
    event.preventDefault();
    varietyTabs[next].focus();
    selectVariety(varietyTabs[next]);
  });
});

const zone = $<HTMLSelectElement>('#delivery-zone');
zone?.addEventListener('change', () => {
  const output = $('#delivery-result');
  if (output) {
    output.textContent =
      (zone.value ? `${zone.value}: ` : '') +
      deliveryMessage(zone.value, site.deliveryRates, site.deliveryNote);
    void motion?.fade(output);
  }
});
const fieldNames = [
  'nombre',
  'tipo',
  'ocasion',
  'presupuesto',
  'flores',
  'colores',
  'tamano',
  'estilo',
  'presentacion',
  'tarjeta',
  'fecha',
  'horario',
  'zona',
  'destinatario',
  'direccion',
  'observaciones',
];
function todayInLima() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}
function readFields(form: HTMLFormElement) {
  const data = new FormData(form);
  return Object.fromEntries(
    fieldNames.map((key) => [key, String(data.get(key) || '').trim()]),
  );
}
let preparedMessage = '';
$$<HTMLFormElement>('[data-order-form]').forEach((form) => {
  const date = form.elements.namedItem('fecha') as HTMLInputElement;
  date.min = todayInLima();
  try {
    const saved = JSON.parse(sessionStorage.getItem(draftKey) || '{}');
    for (const name of fieldNames) {
      const field = form.elements.namedItem(name) as
        HTMLInputElement | HTMLSelectElement | null;
      if (field && typeof saved[name] === 'string') field.value = saved[name];
    }
  } catch {
    /* El formulario funciona sin almacenamiento. */
  }
  const type = form.elements.namedItem('tipo') as HTMLSelectElement;
  const queryType = new URLSearchParams(location.search).get('tipo');
  if (queryType && [...type.options].some((o) => o.value === queryType))
    type.value = queryType;
  if (!type.value && location.pathname.startsWith('/pedido') && cart.length) {
    const product = products.find((p) => p.id === cart[0].id);
    type.value =
      product?.category === 'En macetero'
        ? 'En macetero'
        : product?.category === 'En florero'
          ? 'En florero'
          : product?.category === 'De temporada'
            ? 'De temporada'
            : 'Ramo francés';
  }
  function updateEstimate() {
    const value = (form.elements.namedItem('zona') as HTMLSelectElement).value;
    const note = form.querySelector('.delivery-estimate');
    if (note)
      note.textContent = deliveryMessage(
        value,
        site.deliveryRates,
        site.deliveryNote,
      );
  }
  updateEstimate();
  form.addEventListener('input', () => {
    for (const input of form.querySelectorAll<HTMLInputElement>('input'))
      input.setCustomValidity('');
    try {
      sessionStorage.setItem(draftKey, JSON.stringify(readFields(form)));
    } catch {
      /* No impide preparar el pedido. */
    }
    updateEstimate();
  });
  form.querySelector('[data-clear-draft]')?.addEventListener('click', () => {
    form.reset();
    try {
      sessionStorage.removeItem(draftKey);
    } catch {}
    date.min = todayInLima();
    for (const input of form.querySelectorAll<HTMLInputElement>('input'))
      input.setCustomValidity('');
    updateEstimate();
    toast('Se borraron los datos de tu solicitud.');
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const fields = readFields(form);
    date.min = todayInLima();
    if (fields.fecha < date.min) {
      date.setCustomValidity('Elige una fecha de hoy o posterior.');
      date.reportValidity();
      return;
    }
    for (const name of ['nombre', 'destinatario', 'direccion']) {
      if (!fields[name]) {
        const input = form.elements.namedItem(name) as HTMLInputElement;
        input.setCustomValidity(
          'Completa este dato para preparar tu solicitud.',
        );
        input.reportValidity();
        return;
      }
    }
    if (!form.reportValidity()) return;
    const delivery = deliveryMessage(
      fields.zona,
      site.deliveryRates,
      site.deliveryNote,
    );
    preparedMessage = buildOrderMessage(fields, cart, products, delivery);
    const preview = $('#request-message');
    if (preview) preview.textContent = preparedMessage;
    const url = whatsappUrl(site.whatsapp, preparedMessage);
    const send = $<HTMLAnchorElement>('#whatsapp-send');
    const status = $('#whatsapp-status');
    if (send) {
      send.hidden = !url;
      if (url) send.href = url;
      else send.removeAttribute('href');
    }
    if (status)
      status.textContent = url
        ? 'Al continuar, se abrirá WhatsApp con los detalles para que puedas enviarlos.'
        : 'Nuestro canal de WhatsApp estará disponible pronto. Puedes copiar tu solicitud y conservarla para compartirla con Frisson.';
    const copyStatus = $('#copy-status');
    if (copyStatus) copyStatus.textContent = '';
    openDialog('request-dialog');
  });
});
$('#copy-request')?.addEventListener('click', async () => {
  const status = $('#copy-status');
  try {
    await navigator.clipboard.writeText(preparedMessage);
    if (status)
      status.textContent =
        'Solicitud copiada. Puedes compartirla cuando lo desees.';
  } catch {
    if (status)
      status.textContent =
        'Selecciona y copia el texto del resumen para conservar tu solicitud.';
    const message = $('#request-message');
    if (message) {
      const range = document.createRange();
      range.selectNodeContents(message);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }
});
$$('[data-gallery-image]').forEach((button) =>
  button.addEventListener('click', () => {
    const img = $<HTMLImageElement>('#gallery-full-image');
    if (img) {
      img.src = button.dataset.galleryImage!;
      img.alt = button.dataset.galleryAlt || button.dataset.galleryTitle!;
    }
    const title = $('#gallery-full-title');
    if (title) title.textContent = button.dataset.galleryTitle!;
    const source = $<HTMLAnchorElement>('#gallery-source');
    if (source) {
      source.hidden = !button.dataset.gallerySource;
      source.href = button.dataset.gallerySource || '';
    }
    openDialog('gallery-dialog');
  }),
);

if (location.pathname === '/') {
  const navLinks = $$<HTMLAnchorElement>(
    '.nav-left a[href^="/#"], .history-link[href^="/#"]',
  );
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            const active = link.hash === `#${entry.target.id}`;
            link.classList.toggle('active', active);
            if (active) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
          });
        }
      }
    },
    { rootMargin: '-15% 0% -55% 0%' },
  );
  ['flores', 'colecciones', 'historia'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}

const cleanupMotion = () => {
  window.removeEventListener('frisson:intro-reveal', startMotion);
  ++varietyVersion;
  if (mobileMenu?.open) mobileMenu.close();
  syncMenuClosed();
  motion?.cleanup();
};
document.addEventListener('astro:before-swap', cleanupMotion, { once: true });
window.addEventListener('pagehide', cleanupMotion);
window.addEventListener('pageshow', (event) => {
  if (event.persisted) motion = createMotion();
});
