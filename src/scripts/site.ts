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
let toastTimer: ReturnType<typeof setTimeout>;
function toast(message: string) {
  const el = $('.toast');
  if (!el) return;
  clearTimeout(toastTimer);
  el.textContent = message;
  el.hidden = false;
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
  dialog.close();
}
function openDialog(id: string) {
  const dialog = $<HTMLDialogElement>(`#${id}`);
  if (dialog && !dialog.open) dialog.showModal();
}
$$<HTMLDialogElement>('dialog').forEach((dialog) => {
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
    container.replaceChildren();
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
      const product = products.find((p) => p.id === item.id)!;
      const row = element(
        'article',
        'cart-row py-5 px-0 gap-5 grid grid-cols-[auto_1fr] items-center border-b border-solid border-b-line [&_img]:w-20 [&_img]:h-28 [&_img]:object-contain [&_img]:bg-pale [&_img]:bg-none [&_img]:rounded-full [&_h3]:mx-0 [&_h3]:text-2xl [&_h3]:leading-tight [&_h3]:mt-0 [&_h3]:mb-1.5 [&_p]:text-xs [&_p]:mb-2.5 [&_p]:text-muted max-sm:[&_h3]:text-2xl max-sm:gap-4',
      );
      const img = element('img');
      img.src = `/images/${product.image}.webp`;
      img.alt = product.alt;
      img.width = 80;
      img.height = 110;
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
      quantity.setAttribute(
        'aria-label',
        `${item.quantity} ${item.quantity === 1 ? 'arreglo' : 'arreglos'}`,
      );
      const plus = element('button', undefined, '+');
      plus.type = 'button';
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
    });
  });
  const next = $<HTMLAnchorElement>('#cart-continue');
  if (next) {
    next.textContent = count
      ? 'Preparar mi solicitud →'
      : 'Crear un arreglo personalizado →';
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
const mobileMenu = $('#mobile-menu');
function hideMenu() {
  if (mobileMenu) mobileMenu.hidden = true;
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Abrir menú');
}
menuButton?.addEventListener('click', () => {
  if (!mobileMenu) return;
  mobileMenu.hidden = !mobileMenu.hidden;
  menuButton.setAttribute('aria-expanded', String(!mobileMenu.hidden));
  menuButton.setAttribute(
    'aria-label',
    mobileMenu.hidden ? 'Abrir menú' : 'Cerrar menú',
  );
});
mobileMenu
  ?.querySelectorAll('a')
  .forEach((link) => link.addEventListener('click', hideMenu));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mobileMenu && !mobileMenu.hidden) {
    hideMenu();
    menuButton?.focus();
  }
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
      'Crear mi arreglo →',
    );
    link.href = '/personalizados';
    results.append(link);
    return;
  }
  matches.forEach((p) => {
    const link = element(
      'a',
      'search-result py-4 px-0 gap-5 grid grid-cols-[auto_1fr_auto] items-center border-b border-solid border-b-line [&_img]:w-16 [&_img]:h-20 [&_img]:object-contain [&_img]:bg-pale [&_img]:bg-none [&_img]:rounded-full [&_h3]:m-0 [&_h3]:text-2xl [&_p]:mx-0 [&_p]:text-xs [&_p]:text-muted [&_p]:mt-1 [&_p]:mb-0 max-sm:gap-3 max-sm:grid-cols-[auto_1fr_auto] max-sm:[&_img]:w-14 max-sm:[&_img]:h-16 max-sm:[&_h3]:text-2xl max-sm:[&_p]:text-xs',
    );
    link.href = `/catalogo/${p.id}`;
    const img = element('img');
    img.src = `/images/${p.image}.webp`;
    img.alt = '';
    img.width = 70;
    img.height = 80;
    const copy = element('div');
    copy.append(
      element('h3', undefined, p.name),
      element('p', undefined, p.category),
    );
    link.append(img, copy, element('span', undefined, '↗'));
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
    let count = 0;
    $$('.catalog-grid .product-card').forEach((card) => {
      card.hidden = category !== 'Todas' && card.dataset.category !== category;
      if (!card.hidden) count++;
    });
    const label = $('#catalog-count');
    if (label)
      label.textContent = `${count} ${count === 1 ? 'COMPOSICIÓN' : 'COMPOSICIONES'} PARA INSPIRARTE`;
  }),
);

const varietyTabs = $$<HTMLButtonElement>('[data-variety]');
let varietyTimer: ReturnType<typeof setTimeout>;
function selectVariety(button: HTMLButtonElement) {
  const data = JSON.parse(button.dataset.variety!);
  varietyTabs.forEach((tab) => {
    tab.setAttribute('aria-selected', String(tab === button));
    tab.tabIndex = tab === button ? 0 : -1;
  });
  $('#variety-panel')?.setAttribute('aria-labelledby', button.id);
  const img = $<HTMLImageElement>('#variety-image');
  if (img) {
    clearTimeout(varietyTimer);
    img.classList.add('opacity-0');
    varietyTimer = setTimeout(
      () => {
        img.src = `/images/${data.image}.webp`;
        img.alt = data.alt;
        img.classList.toggle('variety-photo', !!data.sourceUrl);
        img.classList.remove('opacity-0');
      },
      matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 160,
    );
  }
  const price = $('#variety-price');
  if (price)
    price.textContent =
      priceLabel(data.price) + ' · Disponibilidad a coordinar';
  const copy = $('#variety-text');
  if (copy) copy.textContent = data.text;
  const link = $<HTMLAnchorElement>('#variety-link');
  if (link) link.href = `/personalizados?tipo=${encodeURIComponent(data.type)}`;
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
  if (output)
    output.textContent =
      (zone.value ? `${zone.value}: ` : '') +
      deliveryMessage(zone.value, site.deliveryRates, site.deliveryNote);
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

if (
  'IntersectionObserver' in window &&
  !matchMedia('(prefers-reduced-motion: reduce)').matches
) {
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }),
    { threshold: 0.07 },
  );
  $$(
    '.section-heading,.brand-statement blockquote,.story-copy,.steps-grid article',
  ).forEach((el) => {
    el.classList.add(
      ...'reveal-ready transition duration-700 ease-out [&:not(.is-visible)]:opacity-0 [&:not(.is-visible)]:translate-y-5 motion-reduce:[&:not(.is-visible)]:opacity-100 motion-reduce:[&:not(.is-visible)]:translate-y-0'.split(
        ' ',
      ),
    );
    observer.observe(el);
  });
}
if (location.pathname === '/') {
  const navLinks = $$<HTMLAnchorElement>('.nav-left a[href^="/#"]');
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
  ['flores', 'colecciones'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}
