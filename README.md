# Calculadora de precios · Impresión 3D

App web (PWA) para calcular en segundos cuánto cobrar por una impresión 3D.

## Diseño

Interfaz moderna con tarjetas blancas de esquinas redondeadas, sombras suaves y tipografía Inter (más IBM Plex Mono para los números), en modo claro por defecto con opción de modo oscuro. Antes tenía un tema oscuro tipo "plano técnico" — ahora sigue el mismo lenguaje visual usado en las otras apps (Airescare, appvet). Incluso los avisos de confirmación (eliminar un pedido, reiniciar valores, registrar un pago) usan una ventana propia con ese mismo estilo, en vez de los diálogos genéricos del navegador.

## Navegación por pestañas

La app está organizada en 6 pestañas: **Inicio**, **Calculadora**, **Perfiles**, **Historial**, **Pedidos** y **Ajustes**. Cada una guarda su contenido en su propio espacio en vez de tener todo en una sola página larga. La app siempre **abre en Inicio**, sin importar en qué pestaña la hayas dejado la última vez.

**Inicio** es justo eso: lo primero que ves al abrir la app. Saluda según la hora del dispositivo (Buenos días/tardes/noches), así tiene sentido sin importar desde qué país se abra, y muestra cuántos artículos tienes por hacer, por entregar y por cobrar (sin montos de dinero, solo cantidades), más la sección de "Pendientes" agrupada por cliente, para tener un vistazo del negocio sin tener que entrar a la pestaña de Pedidos — tocar un cliente ahí te lleva directo a su perfil, en Pedidos.

En celular y tablet la navegación es una barra fija abajo (como una app móvil). En pantallas de escritorio (900px de ancho o más) se convierte automáticamente en una barra lateral fija a la izquierda, y el contenido usa más ancho — sin necesidad de dos versiones separadas, es la misma página que se adapta con CSS.

## Qué incluye el cálculo

- **Material**: costo por gramo según el precio y peso del rollo, multiplicado por el peso de la pieza y la cantidad. Incluye soportes descartables.
- **Escala de tamaño (en milímetros)**: mides peso y horas una vez, a una medida de referencia (en mm), y luego cotizas la misma pieza a otra medida cambiando solo el campo "Nueva medida a cotizar" — el peso y el tiempo se recalculan automáticamente (escalan al cubo del factor lineal entre ambas medidas), sin volver a laminar en el slicer.
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

La calculadora **abre en modo simple por defecto** — es la vista principal para cotizar rápido — con un interruptor arriba de todo para pasar a modo avanzado cuando necesites ajustar todo con precisión (si abres un link compartido con valores exactos, la app entra directo en modo avanzado para no pisarlos con un estimado).

Modo simple oculta las tarjetas avanzadas y deja solo el **nombre de la figura** (opcional, para guardarla al final), la altura de la pieza (cm, parada como se imprime), el peso (opcional), el tiempo de impresión (opcional, con casillas separadas de horas/minutos/segundos — como lo muestra tu slicer, en vez de una sola cifra decimal), la velocidad de tu impresora, colores, costo del rollo, el consumo de la impresora en Watts, precio de la luz y tu tarifa por hora. La altura se convierte en peso automáticamente, pero si ya conoces el peso real de tu slicer lo puedes poner directamente y ese es el que se usa (igual que con el tiempo); si dejas cualquiera de los dos vacío, la app lo calcula solo con la misma lógica de escala al cubo, ajustada por qué tan rápida es tu impresora (estándar, básica, media-alta, alta velocidad, SparkX i7 Combo con CFS Lite —preseleccionada, con 4 colores por defecto— o un factor personalizado). El resto de los valores (desgaste, fallos, margen) usa cifras típicas. El desglose de resultados siempre muestra el **peso** (además del tiempo), tanto en modo simple como avanzado — la etiqueta dice "estimado" solo cuando ese valor sale de un cálculo (modo simple sin el dato manual, o una pieza reescalada a otra medida); si pusiste el dato exacto, se muestra tal cual, sin ese aviso.

Un selector de **"Tipo de pieza"** cambia entre "Pieza 3D" (por defecto) y **"🔑 Llavero"** — para piezas planas y delgadas (llaveros, placas, insignias...) — que reemplaza el campo de altura por sus medidas reales: ancho × alto × grosor, en milímetros, útiles para llevar el registro de la pieza. Con algo tan delgado, el estimado genérico por tamaño no sirve (no escala como un cubo) y tampoco hay forma confiable de adivinar el peso solo con las medidas sin saber la densidad del filamento — así que en este modo el peso pasa a ser obligatorio: pésala o mira tu slicer y ponlo directamente.

Al final del desglose hay un botón **"💾 Guardar cotización"** que la manda directo al Historial sin salir de la calculadora: en modo simple usa el nombre de la figura que ya pusiste arriba, y si no lo pusiste (o estás en modo avanzado) te lo pregunta ahí mismo.

## Funciones adicionales

- **Perfiles de impresora/filamento**: guarda combinaciones (precio/peso de rollo, watts, precio del kWh, precio y vida útil de la impresora) y cárgalas con un clic. Cada perfil muestra su costo por hora, útil para comparar impresoras.
- **Historial de cotizaciones**: guarda cada pieza cotizada (con todos sus valores) en este dispositivo, cárgala de nuevo o duplícala como punto de partida para una variante.
- **Pedidos**: registra qué le debes entregar a cada cliente y cuánto cobrar. Un botón flotante **"+"** (abajo a la derecha, como en apps móviles modernas y visible desde cualquier pestaña) abre una ventana para agregar o editar un pedido, en vez de tener un formulario largo siempre visible en la pantalla. Ahí armas el pedido con **artículos** (uno por casilla: nombre, cantidad y precio unitario — ej. "2x Llavero", "1x Muñeco"), con un botón "+ Agregar artículo" para ir sumando más; el total se calcula solo a partir de ahí (no hay que escribirlo aparte). El botón "↑ Agregar precio calculado" añade un artículo con el precio que te dio la calculadora, por si no quieres desglosar. Tanto esa ventana como el perfil de un cliente responden al botón "atrás" del celular/navegador — lo cierran o regresan a la vista anterior en vez de salirse de la app.

  Cada **artículo tiene su propio estado** de hecho/entregado/cobrado, independiente de los demás artículos del mismo pedido — así, si le hiciste los llaveros a un cliente pero todavía no le haces la escultura, marcas solo los llaveros como hechos y la escultura se queda pendiente por su cuenta. Cada línea de artículo muestra tres insignias tocables (🖨️ Por hacer / 📦 Por entregar / 💰 Por cobrar, que cambian a ✓ Hecho / ✓ Entregado / ✓ Pagado al tocarlas) para marcarlo. La de cobrar admite **pagos parciales**: si te pagan solo una parte, toca la insignia y pon cuánto te dieron — se descuenta de lo que falta y la insignia cambia a "◐ Debe $X" hasta completarse; un toque en una insignia ya en verde/completa la deshace por si fue un error. El resumen de cuánto has generado, cuánto tienes por cobrar y cuántos artículos faltan por hacer o entregar vive en la pestaña **Inicio**.

  En **Inicio** hay una sección de **"Pendientes"** con tres pestañas — Por hacer / Por entregar / Por cobrar — que funcionan como un filtro: tócalas o **desliza toda la sección hacia los lados** para cambiar de vista (como cambiar de pestaña en una app móvil). Cada vista es solo de consulta: agrupa los artículos pendientes por cliente (un cliente con varios artículos pendientes aparece una sola vez, con todos sus artículos listados debajo), sin botones ni confirmaciones — para marcarlos, toca el nombre del cliente y te lleva directo a su perfil (en Pedidos), donde sí puedes cambiar el estado de cada artículo.

  La lista completa de pedidos agrupa automáticamente por cliente: cada uno aparece una sola vez, con el total de sus pedidos y el monto acumulado, y todos sus pedidos anidados debajo, cada uno con sus artículos y las insignias de cada uno. Tocar el nombre de un cliente **entra a su perfil** — una página dedicada solo para esa persona (se ocultan el resumen general y "Pendientes" mientras la ves) con el resumen de lo cobrado/por cobrar/artículos por entregar, y todos sus pedidos con las insignias de cada artículo siempre visibles, sin importar qué filtro tengas activo; el botón "+" flotante, si lo usas desde aquí, ya trae a este cliente preseleccionado. Un botón "← Volver" regresa a la lista completa. Al agregar un pedido, el campo "Cliente" es un desplegable — eliges uno que ya tengas o creas uno nuevo escribiendo su nombre una sola vez. La lista también tiene un buscador por nombre de cliente y botones de filtro (Todos / Por hacer / Por cobrar / Por entregar), que muestran un pedido si al menos uno de sus artículos sigue pendiente en esa categoría — ambos se pueden combinar.
- **Calculadora inversa**: en vez de fijar tu margen de ganancia, defines el precio que quieres cobrar y la app te dice qué margen real te deja.
- **Comparación con el mercado**: mete un precio de referencia (de la competencia) y ve cuánto te desvías, en monto y porcentaje.
- **Exportar y compartir**: copiar el desglose como texto, compartirlo (Web Share API en celulares), descargarlo como PDF o como imagen PNG del resultado, o generar un link/QR que reabre la calculadora con los mismos valores ya cargados.
- **Ajustes**: pestaña aparte con todo lo que no es calcular — cuenta de Google, tema claro/oscuro y reinicio a valores de fábrica — para no mezclarlo con las demás pestañas.

Todo se guarda en el propio dispositivo (`localStorage`) por defecto. Si inicias sesión con Google (desde la pestaña Ajustes), tus perfiles, historial y pedidos también se sincronizan a tu cuenta vía Firestore, para verlos desde cualquier dispositivo.

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
