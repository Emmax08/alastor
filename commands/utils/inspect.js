import { getUrlFromDirectPath } from "@whiskeysockets/baileys"
import _ from "lodash"

export default {
  command: ["inspect", "inspeccionar"],
  category: "tools",
  run: async (client, m, { args, usedPrefix, command, text }) => {
    // El texto ahora se maneja desde los parámetros de la función para evitar interferencias
    if (!text) return m.reply(`📻 *¡Interferencia!* Por favor, ingrese el enlace de un grupo, comunidad o canal para que pueda sintonizarlo. ♪`)
    
    const channelUrl = text?.match(/(?:https:\/\/)?(?:www\.)?(?:chat\.|wa\.)?whatsapp\.com\/(?:channel\/|joinchat\/)?([0-9A-Za-z]{22,24})/i)?.[1]
    const settings = global.db.data.settings[client.user.id.split(':')[0] + '@s.whatsapp.net']
    let thumb = settings.icon
    let pp 
    let inviteCode

    const MetadataGroupInfo = async (res) => {
      let nameCommunity = ""
      if (res.linkedParent) {
        let linkedGroupMeta = await client.groupMetadata(res.linkedParent).catch(() => null)
        nameCommunity = linkedGroupMeta ? "📻 *Nombre:* " + linkedGroupMeta.subject : ""
      }
      pp = await client.profilePictureUrl(res.id, 'image').catch(() => null)
      inviteCode = await client.groupInviteCode(m.chat).catch(() => null)
      
      const formatParticipants = (participants) => participants && participants.length > 0 ? participants.map((user, i) => `${i + 1}. @${user.id?.split("@")[0]}${user.admin === "superadmin" ? " (𝗦𝘂𝗽𝗲𝗿𝗮𝗱𝗺𝗶𝗻)" : user.admin === "admin" ? " (𝗔𝗱𝗺𝗶𝗻)" : ""}`).join("\n") : "No encontrados"
      
      let caption = `📻 🎙️  *𝗜𝗡𝗙𝗢𝗥𝗠𝗘 𝗗𝗘 𝗜𝗡𝗦𝗣𝗘𝗖𝗖𝗜𝗢𝗡* 🎙️ 📻\n\n` +
      `🆔 *Identificador:* \n> ${res.id || "Desconocido"}\n\n` +
      `👑 *Fundado por:* \n> ${res.owner ? `@${res.owner?.split("@")[0]}` : "Anónimo"} ${res.creation ? `el ${formatDate(res.creation)}` : ""}\n\n` +
      `🏷️ *Título de la Emisora:* \n> ${res.subject || "Sin nombre"}\n\n` +
      `✏️ *Último cambio de nombre:* \n> ${res.subjectOwner ? `@${res.subjectOwner?.split("@")[0]}` : "Desconocido"} ${res.subjectTime ? `el ${formatDate(res.subjectTime)}` : ""}\n\n` +
      `📄 *Manifiesto (Descripción):* \n> ${res.desc || "Sin descripción"}\n\n` +
      `👤 *Autor de la señal:* \n> ${res.author || "Desconocido"}\n\n` +
      `🎫 *Código de Invitación:* \n> ${res.inviteCode || inviteCode || "Privado"}\n\n` +
      `⌛ *Mensajes Temporales:* \n> ${res.ephemeralDuration !== undefined ? `${res.ephemeralDuration} segundos` : "Desactivado"}\n\n` +
      `🛃 *Moderadores Estelares:* \n${formatParticipants(res.participants)}\n\n` +
      `👥 *Audiencia Total:* \n> ${res.size || "Cero"} almas.\n\n` +
      `✨ *𝗗𝗮𝘁𝗼𝘀 𝗔𝘃𝗮𝗻𝘇𝗮𝗱𝗼𝘀* ✨\n\n` +
      `🔎 *Vínculo de Comunidad:* \n> ${res.linkedParent ? "ID: " + res.linkedParent + (nameCommunity ? "\n" + nameCommunity : "") : res.isCommunity ? "Esta es la Comunidad Principal" : "Señal Independiente"}\n\n` +
      `⚠️ *Restricciones:* ${res.restrict ? "✅" : "❌"}\n` +
      `📢 *Modo Anuncio:* ${res.announce ? "✅" : "❌"}\n` +
      `🤝 *Aprobación de Miembros:* ${res.joinApprovalMode ? "✅" : "❌"}\n`
      
      return caption.trim()
    }

    const inviteGroupInfo = async (groupData) => {
      const { id, subject, owner, creation, desc, size, linkedParent, announce, isCommunity } = groupData
      pp = await client.profilePictureUrl(id, 'image').catch(() => null)
      
      let caption = `📻 🎙️  *𝗘𝗫𝗣𝗘𝗗𝗜𝗘𝗡𝗧𝗘 𝗗𝗘 𝗜𝗡𝗩𝗜𝗧𝗔𝗖𝗜𝗢𝗡* 🎙️ 📻\n\n` +
      `🆔 *ID:* ${id}\n` +
      `🏷️ *Nombre:* ${subject}\n` +
      `👑 *Creador:* ${owner ? `@${owner.split('@')[0]}` : "Anónimo"} ${creation ? `el ${formatDate(creation)}` : ""}\n` +
      `📄 *Descripción:* ${desc || "Vacía"}\n` +
      `👥 *Miembros:* ${size} aproximadamente.\n\n` +
      `📢 *Anuncios:* ${announce ? "Sí" : "No"}\n` +
      `🏘️ *Comunidad:* ${isCommunity ? "Sí" : "No"}\n`
      return caption.trim()
    }

    let info, res, inviteInfo
    try {
      // Si se provee texto, asumimos que es un enlace externo
      if (!text.includes("chat.whatsapp.com") && !text.includes("wa.me")) {
        res = await client.groupMetadata(m.chat)
        info = await MetadataGroupInfo(res)
      } else {
        const inviteUrl = text?.match(/(?:https:\/\/)?(?:www\.)?(?:chat\.|wa\.)?whatsapp\.com\/(?:invite\/|joinchat\/)?([0-9A-Za-z]{22,24})/i)?.[1]
        if (inviteUrl) {
          inviteInfo = await client.groupGetInviteInfo(inviteUrl)
          info = await inviteGroupInfo(inviteInfo)
        }
      }
    } catch {
      // Manejo de errores silencioso para reintentar con el flujo de canales
    }

    if (info) {
      const mentions = (res?.participants || inviteInfo?.participants || []).map(p => p.id).filter(id => id.includes('@'))
      await client.sendMessage(m.chat, { text: info, contextInfo: {
        mentionedJid: mentions,
        externalAdReply: {
          title: "📻 Inspector Alastor",
          body: "Sintonizando la verdad...",
          thumbnailUrl: pp || thumb,
          sourceUrl: text,
          mediaType: 1,
          renderLargerThumbnail: false
        }
      }}, { quoted: m })
    } else {
      let newsletterInfo
      if (channelUrl) {
        try {
          newsletterInfo = await client.newsletterMetadata("invite", channelUrl).catch(() => null)
          if (!newsletterInfo) return m.reply("📻 *¡Vaya!* No he podido encontrar ese canal. ¿Seguro que la frecuencia es correcta? ♪")
          
          let caption = "📻 🎙️ *𝗜𝗡𝗦𝗣𝗘𝗖𝗖𝗜𝗢𝗡 𝗗𝗘 𝗖𝗔𝗡𝗔𝗟* 🎙️ 📻\n\n" + processObject(newsletterInfo, "", newsletterInfo?.preview)
          pp = newsletterInfo?.preview ? getUrlFromDirectPath(newsletterInfo.preview) : thumb
          
          await client.sendMessage(m.chat, { text: caption, contextInfo: {
            externalAdReply: {
              title: "📻 Inspector de Frecuencias",
              body: "Analizando la señal del canal...",
              thumbnailUrl: pp,
              sourceUrl: text,
              mediaType: 1,
              renderLargerThumbnail: false
            }
          }}, { quoted: m })
        } catch (e) {
          m.reply(`📻 *¡CRASH!* Error en la sintonía: ${e.message}`)
        }
      } else {
        m.reply(`🎙️ *¡Atención!* Necesito un enlace válido de grupo o canal para empezar mi show. ♪`)
      }
    }
  }
}

// Funciones auxiliares con el mismo espíritu...
function formatDate(n) {
  const date = new Date(n > 1e12 ? n : n * 1000)
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function newsletterKey(key) {
  return _.startCase(key.replace(/_/g, " "))
    .replace("Id", "🆔 Identificador")
    .replace("State", "📌 Estado de Señal")
    .replace("Creation Time", "📅 Primera Emisión")
    .replace("Name", "🏷️ Nombre del Show")
    .replace("Description", "📜 Guion (Descripción)")
    .replace("Subscribers", "👥 Oyentes")
}

function processObject(obj, prefix = "", preview) {
  let caption = ""
  Object.keys(obj).forEach(key => {
    const value = obj[key]
    if (typeof value === "object" && value !== null) {
       // Recursión simple para datos internos
    } else {
      const translatedKey = newsletterKey(key)
      if (!translatedKey.includes("undefined")) {
        caption += `- *${translatedKey}:*\n> ${value || "No disponible"}\n`
      }
    }
  })
  return caption
}
