# Calculadora de precios · Impresión 3D

App web (PWA) para calcular en segundos cuánto cobrar por una impresión 3D.

## Diseño

Interfaz moderna con tarjetas blancas de esquinas redondeadas, sombras suaves y tipografía Inter (más IBM Plex Mono para los números), en modo claro por defecto con opción de modo oscuro. Antes tenía un tema oscuro tipo "plano técnico" — ahora sigue el mismo lenguaje visual usado en las otras apps (Airescare, appvet). Incluso los avisos de confirmación (eliminar un pedido, reiniciar valores, registrar un pago) usan una ventana propia con ese mismo estilo, en vez de los diálogos genéricos del navegador.

## Navegación por pestañas

La app está organizada en 7 pestañas: **Inicio**, **Calculadora**, **Perfiles**, **Historial**, **Pedidos**, **Finanzas** y **Ajustes**. Cada una guarda su contenido en su propio espacio en vez de tener todo en una sola página larga. La app siempre **abre en Inicio**, sin importar en qué pestaña la hayas dejado la última vez.

**Inicio** es justo eso: lo primero que ves al abrir la app. Saluda según la hora del dispositivo (Buenos días/tardes/noches), así tiene sentido sin importar desde qué país se abra, y muestra cuántos artículos tienes por diseñar, por hacer, por entregar y por cobrar (sin montos de dinero, solo cantidades), más la sección de "Pendientes" agrupada por cliente, para tener un vistazo del negocio sin tener que entrar a la pestaña de Pedidos — tocar un cliente ahí te lleva directo a su perfil, en Pedidos. Los montos de dinero (cuánto has generado y cuánto tienes por cobrar) están en su propia pestaña, **Finanzas**.

En celular y tablet la navegación es una barra fija abajo (como una app móvil). En pantallas de escritorio (900px de ancho o más) se convierte automáticamente en una barra lateral fija a la izquierda, y el contenido usa más ancho — sin necesidad de dos versiones separadas, es la misma página que se adapta con CSS.

## Qué incluye el cálculo

- **Material**: costo por gramo según el precio y peso del rollo, multiplicado por el peso de la pieza y la cantidad. Incluye soportes descartables.
- **Tipo de pieza**: igual que en modo simple, un selector "Pieza 3D / 🔑 Llavero" — al elegir Llavero aparecen unas casillas de ancho × alto × grosor (mm) solo de referencia; el peso que se usa en el cálculo sigue siendo el campo de peso de abajo.
- **Altura de la pieza (opcional)**: si no conoces el peso exacto, pon una altura en cm ahí mismo y calculamos el peso por ti (misma lógica de modo simple, escala al cubo) — se llena el campo de peso de abajo, que sigues pudiendo editar a mano después si quieres ajustarlo.
- **Tiempo de impresión en horas/minutos/segundos**: como lo muestra tu slicer, en vez de una sola cifra decimal — el campo interno sigue siendo un decimal para guardarlo/compartirlo, pero se ve y se llena en h/m/s.
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

Modo simple oculta las tarjetas avanzadas y deja solo el **nombre de la pieza** y **nombre del cliente** (ambos opcionales, para guardar la cotización al final identificada), la altura de la pieza (cm, parada como se imprime), el peso (opcional), el tiempo de impresión (opcional, con casillas separadas de horas/minutos/segundos — como lo muestra tu slicer, en vez de una sola cifra decimal), la velocidad de tu impresora, colores, costo del rollo, el consumo de la impresora en Watts, precio de la luz y tu tarifa por hora. La altura se convierte en peso automáticamente, pero si ya conoces el peso real de tu slicer lo puedes poner directamente y ese es el que se usa (igual que con el tiempo); si dejas cualquiera de los dos vacío, la app lo calcula solo con la misma lógica de escala al cubo, ajustada por qué tan rápida es tu impresora (estándar, básica, media-alta, alta velocidad, SparkX i7 Combo con CFS Lite —preseleccionada, con 4 colores por defecto— o un factor personalizado). El resto de los valores (desgaste, fallos, margen) usa cifras típicas. El desglose de resultados siempre muestra el **peso** (además del tiempo), tanto en modo simple como avanzado — la etiqueta dice "estimado" solo cuando ese valor sale de un cálculo (modo simple sin el dato manual, o una pieza reescalada a otra medida); si pusiste el dato exacto, se muestra tal cual, sin ese aviso.

Un selector de **"Tipo de pieza"** cambia entre "Pieza 3D" (por defecto) y **"🔑 Llavero"** — para piezas planas y delgadas (llaveros, placas, insignias...) — que reemplaza el campo de altura por sus medidas reales: ancho × alto × grosor, en milímetros, útiles para llevar el registro de la pieza. Con algo tan delgado, el estimado genérico por tamaño no sirve (no escala como un cubo) y tampoco hay forma confiable de adivinar el peso solo con las medidas sin saber la densidad del filamento — así que en este modo el peso pasa a ser obligatorio: pésala o mira tu slicer y ponlo directamente.

Al final del desglose hay un botón **"💾 Guardar cotización"** que la manda directo al Historial sin salir de la calculadora, usando el nombre de la pieza y del cliente que ya pusiste arriba; si dejaste el nombre de la pieza vacío, te lo pregunta ahí mismo. Modo avanzado tiene los mismos dos campos (nombre de la pieza y del cliente) arriba de la tarjeta de Material. El cliente aparece junto a cada cotización guardada en el Historial, y se restaura solo si vuelves a cargar esa cotización.

## Funciones adicionales

- **Perfiles de impresora/filamento**: la pestaña Perfiles tiene sus propios campos de **modelo** (viene precargado con "SparkX i7 Combo"), **precio de la impresora** y **consumo (Watts)** — los llenas ahí directamente al crear el perfil, sin tener que ir primero a la Calculadora a escribirlos, y de paso quedan aplicados en tu cotización actual. El resto (precio/peso de rollo, precio del kWh, vida útil) se guarda con los valores que tengas en ese momento en la Calculadora. Cárgalos con un clic, o edítalos con el botón "✎" (precarga sus datos en el mismo formulario, con un "Guardar cambios" que actualiza el perfil en vez de crear uno nuevo). Cada perfil muestra su modelo y su costo por hora, útil para comparar impresoras.
- **Historial de cotizaciones**: guarda cada pieza cotizada (con todos sus valores) en este dispositivo, cárgala de nuevo o duplícala como punto de partida para una variante.
- **Pedidos**: registra qué le debes entregar a cada cliente y cuánto cobrar. Un botón flotante **"+"** (abajo a la derecha, como en apps móviles modernas y visible desde cualquier pestaña) abre una ventana para agregar o editar un pedido, en vez de tener un formulario largo siempre visible en la pantalla. Ahí armas el pedido con **artículos** (uno por casilla: nombre, cantidad y precio unitario — ej. "2x Llavero", "1x Muñeco"), con un botón "+ Agregar artículo" para ir sumando más; el total se calcula solo a partir de ahí (no hay que escribirlo aparte). El botón "↑ Agregar precio calculado" añade un artículo con el precio que te dio la calculadora, por si no quieres desglosar. El botón/gesto de "atrás" del celular funciona como una pila: cierra una sola ventana a la vez (el visor de una foto, el selector de fotos, su editor de recortar/rotar, una confirmación, el perfil de un cliente, esta ventana de pedido...) y va regresando de a un paso, sin importar cuántas queden abiertas una encima de otra — nunca salta directo a cerrar la app, que es lo que pasaba antes en varias de estas pantallas. Las **pestañas** también cuentan: alejarte de Inicio hacia cualquier otra pestaña cuenta como un solo paso, sin importar por cuántas pestañas más pases después sin volver a Inicio — así que estando en Perfiles, Historial, Pedidos, Finanzas o Ajustes, "atrás" te manda derecho a Inicio en un solo toque, y recién desde ahí un "atrás" más cierra la app. Dentro de la app empaquetada (APK), esto incluye el botón físico/gesto de atrás de Android — que por sí solo no viene conectado a nada dentro de una app Capacitor y por defecto cierra la app de inmediato — conectado aquí con el plugin nativo "App" para que respete exactamente esta misma pila.

  Cada **artículo tiene su propio estado** de diseñado/hecho/entregado/cobrado, independiente de los demás artículos del mismo pedido — así, si le hiciste los llaveros a un cliente pero todavía no le haces la escultura, marcas solo los llaveros como hechos y la escultura se queda pendiente por su cuenta. Cada línea de artículo muestra cuatro insignias tocables (🎨 Por diseñar / 🖨️ Por hacer / 📦 Por entregar / 💰 Por cobrar, que cambian a ✓ Diseñado / ✓ Hecho / ✓ Entregado / ✓ Pagado al tocarlas) para marcarlo. Debajo de las insignias, cada artículo tiene dos grupos de **fotos** ("Referencia" y "Resultado"), cada uno con **cuantas fotos quieras** (varios ángulos del diseño, del proceso, del resultado terminado, etc.) — el botón "+" al final de cada grupo abre el selector con tres formas de agregarla: **"📷 Tomar foto"** (abre la cámara directo), **"🖼️ Elegir de galería"** (el explorador de archivos de siempre), o **reusar una que ya subiste antes** de un cuadrito con las fotos previas, útil cuando varios clientes piden el mismo diseño: así no se sube la misma imagen varias veces a la nube. Cada miniatura del cuadrito de reusar tiene su propia "✕" para **borrar esa foto de una vez de todos los artículos que la usan** (y de la nube), sin tener que ir uno por uno a buscarla — te lo confirma antes de borrarla porque no se puede deshacer. Al tomar o elegir una foto nueva (no al reusar una) se abre un **editor** para recortarla y/o rotarla (arrastra el recuadro para moverlo, el punto de la esquina para cambiar su tamaño, o gira de a 90°) antes de subirla; "Cancelar" descarta la foto sin subir nada. Cualquiera de las dos primeras se achica sola a un tamaño razonable antes de subir. Tocar una miniatura ya puesta la abre en grande, y la "✕" la quita del artículo (si ninguna otra pieza la sigue usando, además la borra de la nube). La de cobrar admite **pagos parciales**: si te pagan solo una parte, toca la insignia y pon cuánto te dieron — se descuenta de lo que falta y la insignia cambia a "◐ Debe $X" hasta completarse; un toque en una insignia ya en verde/completa la deshace por si fue un error. El resumen de cuánto has generado, cuánto tienes por cobrar y cuántos artículos faltan por hacer o entregar vive en la pestaña **Inicio**.

  En **Inicio** hay una sección de **"Pendientes"** con cuatro pestañas — Por diseñar / Por hacer / Por entregar / Por cobrar — que funcionan como un filtro: tócalas o **desliza toda la sección hacia los lados** para cambiar de vista (como cambiar de pestaña en una app móvil). Siempre **empieza en "Por diseñar"** al abrir la app, sin importar en qué pestaña la hayas dejado la última vez. Cada vista es solo de consulta: agrupa los artículos pendientes por cliente (un cliente con varios artículos pendientes aparece una sola vez, con todos sus artículos listados debajo), sin botones ni confirmaciones — para marcarlos, toca el nombre del cliente y te lleva directo a su perfil (en Pedidos), donde sí puedes cambiar el estado de cada artículo.

  La lista completa de pedidos agrupa automáticamente por cliente: cada uno aparece una sola vez, con el total de sus pedidos y el monto acumulado, y todos sus pedidos anidados debajo, **del más antiguo al más nuevo** (según cuándo los agregaste, no la fecha de entrega que le pusiste). El mismo orden se respeta en el perfil de un cliente. Cada pedido se muestra **colapsado por defecto**: solo el total, la fecha y unos chips de resumen (ej. "🖨️ 1/2 hecho", "💰 debe $6.00", o "✓ listo y pagado" cuando ya está todo al día) — tócalo para desplegar el detalle con las insignias de cada artículo y los botones de editar/eliminar; vuelve a tocarlo para colapsarlo. Si cambias el estado de un artículo (o desde el perfil de un cliente), el pedido se mantiene desplegado en vez de cerrarse. Tocar el nombre de un cliente **entra a su perfil** — una página dedicada solo para esa persona (se ocultan el resumen general y "Pendientes" mientras la ves) con el resumen de lo cobrado/por cobrar/artículos por entregar, y todos sus pedidos con el mismo comportamiento colapsable; el botón "+" flotante, si lo usas desde aquí, ya trae a este cliente preseleccionado. Un botón "✎ Editar" junto al nombre permite **renombrar al cliente** (útil si lo escribiste mal o cambió de nombre/apodo) — el cambio se aplica a todos sus pedidos existentes. Un botón "← Volver" regresa a la lista completa. Al agregar un pedido, el campo "Cliente" es un desplegable — eliges uno que ya tengas o creas uno nuevo escribiendo su nombre una sola vez. La lista también tiene un buscador por nombre de cliente y botones de filtro (Todos / Por diseñar / Por hacer / Por cobrar / Por entregar), que muestran un pedido si al menos uno de sus artículos sigue pendiente en esa categoría — ambos se pueden combinar. Con un filtro activo, al desplegar un pedido solo se listan los artículos que coinciden con ese filtro (ej. con "Por hacer" activo, un pedido con 3 artículos donde ya hiciste 2 solo muestra el que falta) — el total y los chips del encabezado siguen reflejando el pedido completo. Dentro del perfil de un cliente esto no aplica: ahí siempre se ven todos los artículos de todos sus pedidos, sin importar qué filtro tengas activo en la lista general.

  El botón **"📖 Catálogo PDF"** (arriba de la lista de pedidos) genera y descarga un PDF con todos los trabajos que tengan al menos una foto de Referencia o Resultado (todas las que tenga cada grupo, no solo una) — uno por diseño, **sin repetir** aunque varios clientes hayan pedido lo mismo (agrupa por la combinación exacta de fotos; debajo del nombre muestra cuántas veces se pidió y quiénes lo pidieron). Puede tardar unos segundos en generarse porque descarga cada foto de la nube para meterla en el PDF.
- **Calculadora inversa**: en vez de fijar tu margen de ganancia, defines el precio que quieres cobrar y la app te dice qué margen real te deja.
- **Comparación con el mercado**: mete un precio de referencia (de la competencia) y ve cuánto te desvías, en monto y porcentaje.
- **Exportar y compartir**: copiar el desglose como texto, compartirlo (Web Share API en celulares), descargarlo como PDF o como imagen PNG del resultado, o generar un link/QR que reabre la calculadora con los mismos valores ya cargados. Dentro de la app empaquetada (APK/iOS), "descargar" un PDF o PNG (incluido el Catálogo) no usa el truco de siempre del navegador — ahí no hay carpeta de "Descargas" a la que ir, así que en su lugar se abre la hoja nativa de **Compartir/Guardar** del celular, para elegir dónde mandarlo o guardarlo.
- **Ajustes**: pestaña aparte con todo lo que no es calcular — cuenta de Google, tema claro/oscuro y reinicio a valores de fábrica — para no mezclarlo con las demás pestañas.
- **Cuenta bancaria y compartir por WhatsApp**: en Finanzas, debajo del resumen de lo generado/por cobrar, hay un cuadro de texto libre para poner los datos de tu cuenta (banco, número, alias, titular... lo que necesites) — se guarda solo, sin botón aparte, y sincroniza a la nube igual que el resto si iniciaste sesión. El botón "📱 Compartir por WhatsApp" abre WhatsApp con un mensaje ya armado ("Puedes pagarme a esta cuenta: ...") listo para mandarle a quien corresponda.

Todo se guarda en el propio dispositivo (`localStorage`) por defecto. Si inicias sesión con Google (desde la pestaña Ajustes), tus perfiles, historial y pedidos también se sincronizan a tu cuenta vía Firestore, para verlos desde cualquier dispositivo — la web y la app empaquetada (APK) son dispositivos distintos entre sí, así que solo comparten datos cuando ambas tienen la sesión iniciada con la misma cuenta. Mientras tengas sesión iniciada, la app se queda **conectada en vivo** a la nube: un cambio hecho en otro dispositivo (marcar un pedido, agregar uno nuevo) aparece al instante aquí también, sin tener que recargar ni volver a abrir nada.

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

## Fotos de los pedidos (Cloudinary)

Las fotos de "Referencia"/"Resultado" de cada artículo se suben a [Cloudinary](https://cloudinary.com) (no a Firebase Storage, que cobra por uso), usando la **misma cuenta de Cloudinary** que ya comparten las demás apps de esta cuenta — mismo sistema de siempre: cada app en su propia carpeta raíz (esta usa `precios-3d`), y dentro, cada usuario en la suya (`precios-3d/{uid}`, o `precios-3d/local_dispositivo` sin sesión iniciada), organizada además por cliente. La subida se hace directo desde el navegador con un "unsigned upload preset" (`CLOUDINARY_CONFIG` en `index.html`) — sin necesitar backend ni exponer ninguna clave secreta.

Quitar una foto **no la borra de Cloudinary al instante**: por seguridad, borrar de verdad necesita la clave secreta de la cuenta, que nunca debe estar en el código del navegador. En su lugar, la app deja una "solicitud de borrado" guardada en Firestore (`calc3d_usuarios/{uid}/cloudinariaPendientes`), y el **robot** `robot/borrar-cloudinary.js` (corre cada 30 minutos vía `.github/workflows/borrar-cloudinary.yml`, igual que en `registro-de-consumo-con-datos`) la procesa usando esa clave, guardada solo como secreto de GitHub Actions — nunca en el código. Para que el robot funcione hacen falta estos secretos en **Settings → Secrets and variables → Actions** de este repositorio:

- `FIREBASE_SERVICE_ACCOUNT_JSON`: la misma llave de cuenta de servicio que ya usa el robot de notificaciones (`notificaciones-robot/`) — si ya la agregaste para eso, el robot de fotos la reutiliza tal cual.
- `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET`: las de la cuenta de Cloudinary compartida (Dashboard → Settings → API Keys) — las mismas que ya tengas configuradas como secretos en `registro-de-consumo-con-datos`.

Sin esos secretos, las fotos se siguen subiendo y viendo con normalidad — solo que las solicitudes de borrado quedan pendientes hasta que el robot pueda procesarlas.

## Uso

Es una sola página estática (`index.html`), sin backend ni build. Se puede abrir directo en el navegador o publicar con GitHub Pages. Incluye `manifest.json` y `sw.js` para poder instalarse como app (PWA) y funcionar sin conexión una vez visitada.

Las funciones de exportar PDF/imagen y el código QR cargan librerías externas por CDN (jsPDF, html2canvas, qrcode.js), así que necesitan conexión a internet la primera vez que se usan.
