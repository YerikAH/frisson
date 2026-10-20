import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeCart,
  deliveryMessage,
  buildOrderMessage,
  whatsappUrl,
} from '../src/lib/orders.ts';

const products = [
  { id: 'jardin', name: 'Jardín de emociones', price: null },
  { id: 'calma', name: 'Calma en flor', price: 120 },
];
test('una selección dañada no introduce productos ni cantidades arbitrarias', () => {
  assert.deepEqual(sanitizeCart(null, products), []);
  assert.deepEqual(
    sanitizeCart(
      [
        { id: 'desconocido', quantity: 1 },
        { id: 'jardin', quantity: -3 },
        { id: 'calma', quantity: 1.5 },
        { id: 'jardin', quantity: 2 },
        { id: 'jardin', quantity: 150 },
      ],
      products,
    ),
    [{ id: 'jardin', quantity: 99 }],
  );
});
test('sin contacto confirmado no se crea un enlace de envío', () => {
  assert.equal(whatsappUrl('', 'pedido'), null);
  assert.equal(whatsappUrl('123', 'pedido'), null);
});
test('el mensaje de WhatsApp conserva acentos, emoji y símbolos sin crear parámetros extra', () => {
  const message = 'Hola, emoción 🍁 & flores?\nTarjeta: Tú + yo #siempre';
  const url = new URL(whatsappUrl('99999999999', message));
  assert.equal(url.searchParams.get('text'), message);
  assert.equal([...url.searchParams].length, 1);
});
test('el resumen reúne varios productos, personalización, tarjeta y dirección sin confirmar una compra', () => {
  const message = buildOrderMessage(
    {
      nombre: ' Ana ',
      flores: 'Rosas',
      colores: 'Marfil',
      presupuesto: '180',
      tarjeta: 'Gracias 🍁',
      fecha: '2026-10-30',
      horario: '15:30',
      zona: 'El Tambo',
      direccion: 'Dirección de prueba',
      observaciones: 'Tocar el timbre',
    },
    [
      { id: 'jardin', quantity: 2 },
      { id: 'calma', quantity: 1 },
    ],
    products,
    'Delivery por confirmar',
  );
  for (const text of [
    'Jardín de emociones × 2',
    'Calma en flor × 1',
    'Mi nombre: Ana',
    'Tarjeta',
    '2026-10-30',
    '15:30',
    'El Tambo',
    'Dirección de prueba',
    'Tocar el timbre',
    'confirmación de disponibilidad y del importe total',
  ])
    assert.ok(message.toLowerCase().includes(text.toLowerCase()), text);
  assert.equal(message.includes('undefined'), false);
});
test('una creación personalizada se puede solicitar sin seleccionar un producto', () => {
  assert.match(
    buildOrderMessage({ tipo: 'Personalizado' }, [], products, 'Por confirmar'),
    /Selección: Creación personalizada/,
  );
});
test('delivery solo usa tarifas confirmadas, incluida una tarifa de cero', () => {
  assert.equal(deliveryMessage('Chilca', {}, 'Por confirmar'), 'Por confirmar');
  assert.equal(
    deliveryMessage('Huancayo', { Huancayo: -5 }, 'Por confirmar'),
    'Por confirmar',
  );
  assert.match(
    deliveryMessage('El Tambo', { 'El Tambo': 0 }, 'Por confirmar'),
    /0[,.]00/,
  );
  assert.match(
    deliveryMessage('San Carlos', { 'San Carlos': 12 }, 'Por confirmar'),
    /12[,.]00/,
  );
});
