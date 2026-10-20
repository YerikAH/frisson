export interface CartItem {
  id: string;
  quantity: number;
}
export interface OrderProduct {
  id: string;
  name: string;
  price: number | null;
}
export function sanitizeCart(
  value: unknown,
  products: OrderProduct[],
): CartItem[] {
  if (!Array.isArray(value)) return [];
  const result: CartItem[] = [];
  for (const item of value) {
    if (
      !item ||
      typeof item !== 'object' ||
      !products.some((p) => p.id === item.id)
    )
      continue;
    if (!Number.isInteger(item.quantity) || item.quantity < 1) continue;
    const existing = result.find((p) => p.id === item.id);
    if (existing)
      existing.quantity = Math.min(99, existing.quantity + item.quantity);
    else result.push({ id: item.id, quantity: Math.min(99, item.quantity) });
  }
  return result;
}
export function deliveryMessage(
  zone: string,
  rates: Record<string, number>,
  fallback: string,
) {
  const rate = rates[zone];
  return zone && Number.isFinite(rate) && rate >= 0
    ? `Delivery estimado: ${new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(rate)}. Sujeto a confirmación de la dirección.`
    : fallback;
}
export function whatsappUrl(number: string, message: string): string | null {
  const clean = number.replace(/\D/g, '');
  return /^\d{8,15}$/.test(clean)
    ? `https://wa.me/${clean}?text=${encodeURIComponent(message)}`
    : null;
}
export function buildOrderMessage(
  fields: Record<string, string>,
  cart: CartItem[],
  products: OrderProduct[],
  delivery: string,
): string {
  const selected = cart.map(
    (item) =>
      `${products.find((p) => p.id === item.id)?.name || item.id} × ${item.quantity}`,
  );
  const labels: Record<string, string> = {
    nombre: 'Mi nombre',
    tipo: 'Tipo de arreglo',
    ocasion: 'Ocasión',
    flores: 'Flores preferidas',
    colores: 'Colores',
    tamano: 'Tamaño',
    estilo: 'Forma o estilo',
    presupuesto: 'Presupuesto aproximado (S/)',
    presentacion: 'Presentación',
    tarjeta: 'Mensaje de la tarjeta',
    fecha: 'Fecha deseada',
    horario: 'Horario deseado',
    zona: 'Zona',
    destinatario: 'Persona que recibe',
    direccion: 'Dirección',
    observaciones: 'Indicaciones adicionales',
  };
  const details = Object.entries(labels)
    .filter(([key]) => fields[key]?.trim())
    .map(([key, label]) => `${label}: ${fields[key].trim()}`);
  return [
    'Hola, Frisson. Me gustaría solicitar un arreglo floral.',
    '',
    `Selección: ${selected.length ? selected.join('; ') : 'Creación personalizada'}`,
    ...details,
    '',
    delivery,
    '',
    'Quedo pendiente de la confirmación de disponibilidad y del importe total. Muchas gracias.',
  ].join('\n');
}
