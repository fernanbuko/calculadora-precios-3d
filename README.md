# Calculadora de precios · Impresión 3D

App web (PWA) para calcular en segundos cuánto cobrar por una impresión 3D.

## Diseño

Interfaz moderna con tarjetas blancas de esquinas redondeadas, sombras suaves y tipografía Inter (más IBM Plex Mono para los números), en modo claro por defecto con opción de modo oscuro. Antes tenía un tema oscuro tipo "plano técnico" — ahora sigue el mismo lenguaje visual usado en las otras apps (Airescare, appvet). Incluso los avisos de confirmación (eliminar un pedido, reiniciar valores, registrar un pago) usan una ventana propia con ese mismo estilo, en vez de los diálogos genéricos del navegador.

## Navegación por pestañas

La app está organizada en 4 pestañas: **Calculadora**, **Perfiles**, **Historial** y **Pedidos**. Cada una guarda su contenido en su propio espacio en vez de tener todo en una sola página larga, y la última pestaña abierta se recuerda entre visitas.

En celular y tablet la navegación es una barra fija abajo (como una app móvil). En pantallas de escritorio (900px de ancho o más) se convierte automáticamente en una barra lateral fija a la izquierda, y el contenido usa más ancho — sin necesidad de dos versiones separadas, es la misma página que se adapta con CSS.

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

## Modo simple

Un interruptor arriba de todo activa el **modo simple**: oculta las tarjetas avanzadas y deja solo el tamaño de la pieza (cm), las horas de impresión (opcional), la velocidad de tu impresora, colores, costo del rollo, precio de la luz y tu tarifa por hora. El tamaño se convierte en peso automáticamente, y si conoces las horas reales de tu slicer las puedes poner directamente; si dejas ese campo vacío, la app las calcula sola con la misma lógica de escala al cubo, ajustada por qué tan rápida es tu impresora (estándar, básica, media-alta, alta velocidad, SparkX i7 Combo con CFS Lite —preseleccionada, con 4 colores por defecto— o un factor personalizado). El resto de los valores (desgaste, fallos, margen) usa cifras típicas. Se puede volver al modo avanzado en cualquier momento para ajustar todo con precisión.

## Funciones adicionales

- **Perfiles de impresora/filamento**: guarda combinaciones (precio/peso de rollo, watts, precio del kWh, precio y vida útil de la impresora) y cárgalas con un clic. Cada perfil muestra su costo por hora, útil para comparar impresoras.
- **Historial de cotizaciones**: guarda cada pieza cotizada (con todos sus valores) en este dispositivo, cárgala de nuevo o duplícala como punto de partida para una variante.
- **Pedidos**: registra qué le debes entregar a cada cliente y cuánto cobrar. Cada pedido se arma con **artículos** (uno por casilla: nombre, cantidad y precio unitario — ej. "2x Llavero", "1x Muñeco"), con un botón "+ Agregar artículo" para ir sumando más; el total se calcula solo a partir de ahí (no hay que escribirlo aparte). El botón "↑ Agregar precio calculado" añade un artículo con el precio que te dio la calculadora, por si no quieres desglosar.

  Cada **artículo tiene su propio estado** de hecho/entregado/cobrado, independiente de los demás artículos del mismo pedido — así, si le hiciste los llaveros a un cliente pero todavía no le haces la escultura, marcas solo los llaveros como hechos y la escultura se queda pendiente por su cuenta. Cada línea de artículo muestra tres insignias tocables (🖨️ Por hacer / 📦 Por entregar / 💰 Por cobrar, que cambian a ✓ Hecho / ✓ Entregado / ✓ Pagado al tocarlas) para marcarlo. La de cobrar admite **pagos parciales**: si te pagan solo una parte, toca la insignia y pon cuánto te dieron — se descuenta de lo que falta y la insignia cambia a "◐ Debe $X" hasta completarse; un toque en una insignia ya en verde/completa la deshace por si fue un error. Ve de un vistazo, arriba de todo, cuánto has generado en total (lo ya cobrado, parcial incluido), cuánto tienes por cobrar y cuántos artículos faltan por hacer o entregar.

  Arriba de todo hay una sección de **"Pendientes"** con tres pestañas — Por hacer / Por entregar / Por cobrar — que funcionan como un filtro: tócalas o **desliza toda la sección hacia los lados** para cambiar de vista (como cambiar de pestaña en una app móvil). Cada vista es solo de consulta: agrupa los artículos pendientes por cliente (un cliente con varios artículos pendientes aparece una sola vez, con todos sus artículos listados debajo), sin botones ni confirmaciones — para marcarlos, toca el nombre del cliente y te lleva directo a su perfil, donde sí puedes cambiar el estado de cada artículo.

  La lista completa de pedidos agrupa automáticamente por cliente: cada uno aparece una sola vez, con el total de sus pedidos y el monto acumulado, y todos sus pedidos anidados debajo, cada uno con sus artículos y las insignias de cada uno. Tocar el nombre de un cliente **entra a su perfil** — una vista dedicada con el resumen de lo cobrado/por cobrar/artículos por entregar de esa persona, y todos sus pedidos con las insignias de cada artículo siempre visibles, sin importar qué filtro tengas activo. Un botón "← Volver" regresa a la lista completa. Al agregar uno, el campo "Cliente" es un desplegable — eliges uno que ya tengas o creas uno nuevo escribiendo su nombre una sola vez; después de guardar, ese mismo cliente queda seleccionado, así que si le agregas otro pedido seguido no hay que volver a buscarlo. La lista también tiene botones de filtro (Todos / Por hacer / Por cobrar / Por entregar), que muestran un pedido si al menos uno de sus artículos sigue pendiente en esa categoría.
- **Calculadora inversa**: en vez de fijar tu margen de ganancia, defines el precio que quieres cobrar y la app te dice qué margen real te deja.
- **Comparación con el mercado**: mete un precio de referencia (de la competencia) y ve cuánto te desvías, en monto y porcentaje.
- **Exportar y compartir**: copiar el desglose como texto, compartirlo (Web Share API en celulares), descargarlo como PDF o como imagen PNG del resultado, o generar un link/QR que reabre la calculadora con los mismos valores ya cargados.
- **Modo claro/oscuro** y **reinicio a valores de fábrica** con un clic.

Todo se guarda en el propio dispositivo (`localStorage`) por defecto. Si inicias sesión con Google (banner arriba de todo, visible en cualquier pestaña), tus perfiles, historial y pedidos también se sincronizan a tu cuenta vía Firestore, para verlos desde cualquier dispositivo.

## Configurar el inicio de sesión con Google

Por defecto el botón de Google muestra un aviso de que falta configurarlo — hace falta un proyecto de Firebase propio (gratis) para activarlo:

1. Crea un proyecto en [console.firebase.google.com](https://console.firebase.google.com) (o usa uno que ya tengas) y agrégale una **app web** para obtener su configuración.
2. En **Authentication → Sign-in method**, habilita el proveedor **Google**.
3. En **Firestore Database**, crea la base de datos (modo producción) y en la pestaña **Reglas** pega:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /calc3d_usuarios/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```
4. En `index.html`, busca el bloque `const firebaseConfig = { ... }` (cerca del inicio del `<script>` principal) y reemplaza los valores `"TU_..."` por los de tu proyecto (Configuración del proyecto → General → "Tus apps").

Estos datos de configuración son públicos (no son contraseñas) — la seguridad real la dan las reglas de Firestore del paso 3, que solo dejan a cada usuario leer y escribir sus propios datos.

## Uso

Es una sola página estática (`index.html`), sin backend ni build. Se puede abrir directo en el navegador o publicar con GitHub Pages. Incluye `manifest.json` y `sw.js` para poder instalarse como app (PWA) y funcionar sin conexión una vez visitada.

Las funciones de exportar PDF/imagen y el código QR cargan librerías externas por CDN (jsPDF, html2canvas, qrcode.js), así que necesitan conexión a internet la primera vez que se usan.
