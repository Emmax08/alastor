import axios from "axios"

// Función para obtener información del prefijo (País y riesgo)
// Nota: Puedes ampliar esta lista según necesites
function getPhoneInfo(number) {
  const prefixes = [
    { code: "1", country: "USA/Canadá", risk: "Alto (Muy común en apps virtuales)" },
    { code: "371", country: "Letonia", risk: "Muy Alto (Virtual/Bot)" },
    { code: "380", country: "Ucrania", risk: "Alto (Virtual)" },
    { code: "44", country: "Reino Unido", risk: "Medio/Alto (Virtual)" },
    { code: "48", country: "Polonia", risk: "Alto (Virtual)" },
    { code: "994", country: "Azerbaiyán", risk: "Muy Alto (Bot/Spam)" },
    { code: "52", country: "México", risk: "Bajo (Orgánico)" },
    { code: "54", country: "Argentina", risk: "Bajo (Orgánico)" },
    { code: "57", country: "Colombia", risk: "Bajo (Orgánico)" },
    { code: "34", country: "España", risk: "Bajo (Orgánico)" }
  ]

  // Buscar el prefijo que coincida al inicio del número
  const info = prefixes.find(p => number.startsWith(p.code))
  return info || { country: "Desconocido", risk: "Desconocido (Analizar manualmente)" }
}

export default {
  command: ["numberinspect", "inspect", "numinfo"],
  category: "utils",
  run: async (client, m, args, usedPrefix, command) => {
    // 1. Obtener el JID (ID de WhatsApp) de la mención, respuesta o texto
    let who
    if (m.isGroup) {
      who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : args[0] ? args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net" : null
    } else {
      who = m.quoted ? m.quoted.sender : args[0] ? args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net" : m.chat
    }

    if (!who) {
      return client.reply(
        m.chat,
        `✿ Etiqueta a alguien, responde a un mensaje o escribe el número completo con el prefijo.\n\n` +
        `*Ejemplo:* ${usedPrefix + command} @user\n` +
        `*Ejemplo:* ${usedPrefix + command} 1234567890`,
        m
      )
    }

    try {
      const number = who.split("@")[0]
      const info = getPhoneInfo(number)
      const isVirtual = info.risk.includes("Alto") || info.risk.includes("Muy Alto")

      const report = `𖹭 ❀ *Number Inspector*\n\n` +
        `ׅ  ׄ  ✿   ׅ り *Número ›* +${number}\n` +
        `ׅ  ׄ  ✿   ׅ り *País ›* ${info.country}\n` +
        `ׅ  ׄ  ✿   ׅ り *Riesgo ›* ${info.risk}\n` +
        `ׅ  ׄ  ✿   ׅ り *Tipo ›* ${isVirtual ? "Virtual / Fake" : "Probable Real"}\n\n` +
        `ׅ  ׄ  ✿   ׅ り *Analizado por ›* ${m.pushName || "Emmax-kun"}`

      return m.reply(report)
    } catch (e) {
      console.error(e)
      await m.reply("ꕥ Ocurrió un error al analizar el número.")
    }
  }
}
