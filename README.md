# Calculadora de precios · Impresión 3D

App web (PWA) para calcular en segundos cuánto cobrar por una impresión 3D.

## Qué incluye el cálculo

- **Material**: costo por gramo según el precio y peso del rollo, multiplicado por el peso de la pieza y la cantidad.
- **Electricidad**: consumo de la impresora (W) durante las horas de impresión, al precio del kWh.
- **Desgaste de máquina**: precio de la impresora ÷ vida útil estimada (horas), por las horas usadas.
- **Tu tiempo**: horas de diseño/preparación/post-procesado × tu tarifa por hora.
- **Multicolor (opcional)**: material perdido en purgas por cada cambio de color + tiempo extra que eso agrega.
- **Margen por fallos** y **margen de ganancia**, aplicados sobre el costo total.

```
COSTO  = MATERIAL + ELECTRICIDAD + DESGASTE + TIEMPO
PRECIO = COSTO × (1 + % FALLOS) × (1 + % GANANCIA)
```

Todo se recalcula en tiempo real mientras escribes, en la moneda que elijas.

## Uso

Es una sola página estática (`index.html`), sin backend ni build. Se puede abrir directo en el navegador o publicar con GitHub Pages. Incluye `manifest.json` y `sw.js` para poder instalarse como app (PWA) y funcionar sin conexión una vez visitada.
