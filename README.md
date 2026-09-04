# Calculadora de precios · Impresión 3D

App web (PWA) para calcular en segundos cuánto cobrar por una impresión 3D.

## Qué incluye el cálculo

- **Material**: costo por gramo según el precio y peso del rollo, multiplicado por el peso de la pieza y la cantidad. Incluye soportes descartables.
- **Escala de tamaño**: mides peso y horas una vez (al 100%) y luego cotizas la misma pieza más grande o más chica cambiando el porcentaje de escala — el peso y el tiempo se recalculan automáticamente (escalan al cubo del factor lineal), sin volver a laminar en el slicer.
- **Electricidad**: consumo de la impresora (W) durante las horas de impresión, al precio del kWh.
- **Desgaste de máquina**: precio de la impresora ÷ vida útil estimada (horas), por las horas usadas.
- **Tu tiempo**: horas de diseño/preparación/post-procesado × tu tarifa por hora.
- **Multicolor (opcional)**: material perdido en purgas por cada cambio de color (con precio de purga distinto opcional) + tiempo extra que eso agrega.
- **Consumibles extra**: lista libre de costos fijos (boquilla, pegamento, lijado, pintura, caja...) + envío/empaque.
- **Margen por fallos** y **margen de ganancia**, aplicados sobre el costo total.

```
COSTO  = MATERIAL + ELECTRICIDAD + DESGASTE + TIEMPO + EXTRAS
PRECIO = COSTO × (1 + % FALLOS) × (1 + % GANANCIA)
```

Todo se recalcula en tiempo real mientras escribes, en la moneda que elijas.

## Funciones adicionales

- **Perfiles de impresora/filamento**: guarda combinaciones (precio/peso de rollo, watts, precio del kWh, precio y vida útil de la impresora) y cárgalas con un clic. Cada perfil muestra su costo por hora, útil para comparar impresoras.
- **Historial de cotizaciones**: guarda cada pieza cotizada (con todos sus valores) en este dispositivo, cárgala de nuevo o duplícala como punto de partida para una variante.
- **Calculadora inversa**: en vez de fijar tu margen de ganancia, defines el precio que quieres cobrar y la app te dice qué margen real te deja.
- **Comparación con el mercado**: mete un precio de referencia (de la competencia) y ve cuánto te desvías, en monto y porcentaje.
- **Exportar y compartir**: copiar el desglose como texto, compartirlo (Web Share API en celulares), descargarlo como PDF o como imagen PNG del resultado, o generar un link/QR que reabre la calculadora con los mismos valores ya cargados.
- **Modo claro/oscuro** y **reinicio a valores de fábrica** con un clic.

Todo se guarda solo en el propio dispositivo (`localStorage`) — no hay servidor ni cuenta.

## Uso

Es una sola página estática (`index.html`), sin backend ni build. Se puede abrir directo en el navegador o publicar con GitHub Pages. Incluye `manifest.json` y `sw.js` para poder instalarse como app (PWA) y funcionar sin conexión una vez visitada.

Las funciones de exportar PDF/imagen y el código QR cargan librerías externas por CDN (jsPDF, html2canvas, qrcode.js), así que necesitan conexión a internet la primera vez que se usan.
