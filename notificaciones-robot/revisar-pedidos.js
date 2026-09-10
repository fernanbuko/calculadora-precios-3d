// Este script lo ejecuta GitHub Actions cada cierto tiempo (ver
// .github/workflows/revisar-pedidos.yml). Revisa, para cada cuenta con
// notificaciones nativas activadas (campo fcmTokensNativos en su
// documento), sus pedidos pendientes y manda dos tipos de aviso:
//
//   1. Aviso INMEDIATO: la primera vez que un artículo de un pedido queda
//      pendiente (por hacer, entregar o cobrar), se manda un push una
//      sola vez — se marca con "avisoPendienteEnviado" para no repetirlo
//      en cada corrida.
//   2. Resumen DIARIO: una vez al día (a partir de las 8am hora Ecuador),
//      si sigue habiendo algo pendiente, un resumen con los totales —
//      para no olvidarse de lo que lleva tiempo sin resolverse.
//
// A los tokens nativos SIEMPRE se les manda el campo "notification"
// (además de "data"): es lo que hace que Android/iOS muestren el aviso
// solos, aunque la app lleve tiempo cerrada — con solo "data" el sistema
// operativo no muestra nada si la app no está corriendo.
//
// No modifica nada más de la app: solo LEE los pedidos y ESCRIBE las
// marcas de "ya avisado" para no repetir el mismo aviso.

const admin = require("firebase-admin");

const crudo = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || "";
let serviceAccount;
try {
  serviceAccount = JSON.parse(crudo);
} catch (e) {
  console.error("❌ El secreto FIREBASE_SERVICE_ACCOUNT_JSON no se pudo leer como JSON válido.");
  console.error("Longitud recibida (caracteres):", crudo.length);
  console.error("Mensaje del error de parseo:", e.message);
  process.exit(1);
}
if (!serviceAccount.private_key || !serviceAccount.client_email || !serviceAccount.project_id) {
  console.error("❌ El JSON se leyó, pero le faltan campos esperados (private_key, client_email o project_id).");
  process.exit(1);
}
console.log("✅ Llave de servicio leída correctamente para el proyecto:", serviceAccount.project_id);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const messaging = admin.messaging();

// Hora (0-23, en Ecuador/UTC-5) a partir de la cual se manda el resumen
// diario — así no llega a medianoche, sino ya empezando el día.
const HORA_RESUMEN_DIARIO = 8;

function hoyEcuadorComoTexto() {
  const ahoraEcuador = new Date(Date.now() - 5 * 60 * 60 * 1000);
  const y = ahoraEcuador.getUTCFullYear();
  const m = String(ahoraEcuador.getUTCMonth() + 1).padStart(2, "0");
  const d = String(ahoraEcuador.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function horaActualEcuador() {
  return new Date(Date.now() - 5 * 60 * 60 * 1000).getUTCHours();
}

// Manda el push a un grupo de tokens nativos, y limpia de la lista los que
// Firebase reporta como definitivamente inválidos (app desinstalada, etc.)
// para que esa cuenta no se quede intentando mandarle avisos para siempre
// a un dispositivo que ya no existe.
async function mandarPushNativo(usuarioRef, tokens, { title, body }, etiqueta) {
  if (!tokens || tokens.length === 0) return;
  try {
    const resultado = await messaging.sendEachForMulticast({
      notification: { title, body },
      data: { title, body },
      tokens,
      android: { priority: "high" },
      apns: { headers: { "apns-priority": "10" }, payload: { aps: { sound: "default" } } },
    });
    console.log(`[${etiqueta}] "${title}": ${resultado.successCount} éxito(s), ${resultado.failureCount} fallo(s).`);

    const tokensInvalidos = [];
    resultado.responses.forEach((r, i) => {
      if (!r.success && r.error?.code === "messaging/registration-token-not-registered") {
        tokensInvalidos.push(tokens[i]);
      }
    });
    if (tokensInvalidos.length > 0) {
      await usuarioRef.set(
        { fcmTokensNativos: admin.firestore.FieldValue.arrayRemove(...tokensInvalidos) },
        { merge: true }
      );
      console.log(`[${etiqueta}] Se quitaron ${tokensInvalidos.length} token(s) inválido(s).`);
    }
  } catch (e) {
    console.error(`[${etiqueta}] Error enviando notificación:`, e.message);
  }
}

async function revisarCuenta(usuarioRef, data) {
  const tokens = Array.isArray(data.fcmTokensNativos) ? data.fcmTokensNativos : [];
  if (tokens.length === 0) return; // sin dispositivos con notificaciones activadas

  const orders = Array.isArray(data.orders) ? data.orders : [];
  let huboCambios = false;
  const nuevosPendientes = [];
  let pendHacer = 0,
    pendEntregar = 0,
    pendCobrar = 0;

  orders.forEach((o) => {
    (o.items || []).forEach((it) => {
      if (!it.hecho) pendHacer++;
      if (!it.entregado) pendEntregar++;
      if (!it.pagado) pendCobrar++;
      const pendiente = !it.hecho || !it.entregado || !it.pagado;
      if (pendiente && !it.avisoPendienteEnviado) {
        nuevosPendientes.push({ cliente: o.cliente || "Sin nombre", nombre: it.nombre || "(artículo)" });
        it.avisoPendienteEnviado = true;
        huboCambios = true;
      }
    });
  });

  for (const np of nuevosPendientes) {
    await mandarPushNativo(
      usuarioRef,
      tokens,
      { title: `Nuevo pedido pendiente: ${np.nombre}`, body: `Cliente: ${np.cliente}` },
      usuarioRef.id
    );
  }

  const hoy = hoyEcuadorComoTexto();
  const yaEnviadoHoy = data.ultimoResumenPedidosEnviado === hoy;
  const totalPendientes = pendHacer + pendEntregar + pendCobrar;
  if (!yaEnviadoHoy && horaActualEcuador() >= HORA_RESUMEN_DIARIO && totalPendientes > 0) {
    const partes = [];
    if (pendHacer) partes.push(`${pendHacer} por hacer`);
    if (pendEntregar) partes.push(`${pendEntregar} por entregar`);
    if (pendCobrar) partes.push(`${pendCobrar} por cobrar`);
    await mandarPushNativo(
      usuarioRef,
      tokens,
      { title: "Resumen de pedidos pendientes", body: partes.join(", ") },
      usuarioRef.id
    );
    await usuarioRef.set({ ultimoResumenPedidosEnviado: hoy }, { merge: true });
  }

  if (huboCambios) {
    await usuarioRef.set({ orders }, { merge: true });
  }
}

async function main() {
  const usuarios = await db.collection("calc3d_usuarios").listDocuments();
  console.log(`Revisando ${usuarios.length} cuenta(s)...`);
  for (const usuarioRef of usuarios) {
    const doc = await usuarioRef.get();
    if (!doc.exists) continue;
    try {
      await revisarCuenta(usuarioRef, doc.data());
    } catch (e) {
      console.error(`[${usuarioRef.id}] Error revisando la cuenta:`, e.message);
    }
  }
  console.log("Listo.");
}

main().catch((e) => {
  console.error("Error general del robot:", e);
  process.exit(1);
});
