# Calculadora de precios · Impresión 3D

App web (PWA) para calcular en segundos cuánto cobrar por una impresión 3D.

## Diseño

Interfaz moderna con tarjetas blancas de esquinas redondeadas, sombras suaves y tipografía Inter (más IBM Plex Mono para los números), en modo claro por defecto con opción de modo oscuro. Antes tenía un tema oscuro tipo "plano técnico" — ahora sigue el mismo lenguaje visual usado en las otras apps (Airescare, appvet).

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
- **Pedidos**: registra qué le debes entregar a cada cliente y cuánto cobrar (con el botón "Usar precio calculado" para copiar el precio de la calculadora), marca cada uno como hecho/entregado/pagado con un toque, edítalos cuando cambien los datos, y ve de un vistazo cuánto has generado en total (pedidos ya pagados), cuánto tienes por cobrar y cuántos pedidos faltan. Arriba de todo hay una sección de **"Pendientes por hacer"** — una cola de producción con solo lo que aún no has fabricado, para saber qué imprimir primero. La lista completa de pedidos agrupa automáticamente por cliente (como un perfil): cada cliente aparece una sola vez, con el total de sus pedidos y el monto acumulado, y todos sus pedidos anidados debajo. Al agregar uno, el campo "Cliente" es un desplegable — eliges uno que ya tengas o creas uno nuevo escribiendo su nombre una sola vez; después de guardar, ese mismo cliente queda seleccionado, así que si le agregas otro pedido seguido no hay que volver a buscarlo. La lista también tiene botones de filtro (Todos / Por hacer / Por cobrar / Por entregar).
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
