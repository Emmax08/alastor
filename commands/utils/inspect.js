import { getUrlFromDirectPath } from "@whiskeysockets/baileys"
import _ from "lodash"

export default {
  command: ["inspect", "inspeccionar"],
  category: "tools",
  run: async (client, m, args, usedPrefix, command) => {
    // Definimos 'text' manualmente uniendo los argumentos para evitar errores
    const text = args && args.length ? args.join(" ") : ""
    
    if (!text) {
      return m.reply(`📻 *¡Interferencia!* Por favor, ingrese el enlace de un grupo o canal para que pueda sintonizarlo. ♪`)
    }
    
    const settings = global.db.data.settings[client.user.id.split(':')[0] + '@s.whatsapp.net'] || {}
    let thumb = settings.icon || "https://i.imgur.com/8N7CHRh.png"
    let pp 
    let inviteCode
    let info, res, inviteInfo

    // --- Funciones Internas de Procesamiento ---
    const MetadataGroupInfo = async (res) => {
      let nameCommunity = ""
      if (res.linkedParent) {
        let linkedGroupMeta = await client.groupMetadata(res.linkedParent).catch(() => null)
        nameCommunity = linkedGroupMeta ? "📻 *Nombre:* " + linkedGroupMeta.subject : ""
      }
      pp = await client.profilePictureUrl(res.id, 'image').catch(() => null)
      inviteCode = await client.groupInviteCode(m.chat).catch(() => null)
      
      const formatParticipants = (participants) => participants && participants.length > 0 
        ? participants.slice(0, 15).map((user, i) => `${i + 1}. @${user.id?.split("@")[0]}${user.admin === "superadmin" ? " (𝗦𝘂𝗽𝗲𝗿𝗮𝗱𝗺𝗶𝗻)" : user.admin === "admin" ? " (𝗔𝗱𝗺𝗶𝗻)" : ""}`).join("\n") + (participants.length > 15 ? `\n... y ${participants.length - 15} almas más.` : "")
        : "No encontrados"
      
      return `📻 🎙️  *𝗜𝗡𝗙𝗢𝗥𝗠𝗘 𝗗𝗘 𝗜𝗡𝗦𝗣𝗘𝗖𝗖𝗜𝗢𝗡* 🎙️ 📻\n\n` +
      `🆔 *ID:* \n> ${res.id || "Desconocido"}\n` +
      `👑 *Dueño:* \n> ${res.owner ? `@${res.owner?.split("@")[0]}` : "Anónimo"} ${res.creation ? `(${formatDate(res.creation)})` : ""}\n` +
      `🏷️ *Título:* \n> ${res.subject || "Sin nombre"}\n` +
      `📄 *Descripción:* \n> ${res.desc || "Sin descripción"}\n` +
      `🎫 *Invitación:* \n> ${res.inviteCode || inviteCode || "Privado"}\n` +
      `👥 *Audiencia:* \n> ${res.size || "0"} almas.\n\n` +
      `🛃 *Moderadores:* \n${formatParticipants(res.participants)}\n\n` +
      `✨ *Estado:* ${res.restrict ? "✅ Restringido" : "❌ Libre"}\n` +
      `📢 *Anuncio:* ${res.announce ? "✅ Sí" : "❌ No"}`
    }

    const inviteGroupInfo = async (groupData) => {
      const { id, subject, owner, creation, desc, size, announce, isCommunity } = groupData
      pp = await client.profilePictureUrl(id, 'image').catch(() => null)
      return `📻 🎙️  *𝗘𝗫𝗣𝗘𝗗𝗜𝗘𝗡𝗧𝗘 𝗗𝗘 𝗜𝗡𝗩𝗜𝗧𝗔𝗖𝗜𝗢𝗡* 🎙️ 📻\n\n` +
      `🆔 *ID:* ${id}\n` +
      `🏷️ *Nombre:* ${subject}\n` +
      `👑 *Creador:* ${owner ? `@${owner.split('@')[0]}` : "Anónimo"}\n` +
      `📅 *Creado:* ${creation ? formatDate(creation) : "Desconocido"}\n` +
      `👥 *Miembros:* ~${size}\n` +
      `🏘️ *Es Comunidad:* ${isCommunity ? "Sí" : "No"}\n` +
      `📄 *Descripción:* \n> ${desc || "Vacía"}`
    }

    // --- Lógica Principal ---
    try {
      if (!text.includes("chat.whatsapp.com") && !text.includes("wa.me")) {
        // Inspección de grupo actual si no hay link
        res = await client.groupMetadata(m.chat)
        info = await MetadataGroupInfo(res)
      } else {
        // Inspección vía enlace de invitación
        const inviteUrl = text?.match(/(?:https:\/\/)?(?:www\.)?(?:chat\.|wa\.)?whatsapp\.com\/(?:invite\/|joinchat\/)?([0-9A-Za-z]{22,24})/i)?.[1]
        if (inviteUrl) {
          inviteInfo = await client.groupGetInviteInfo(inviteUrl)
          info = await inviteGroupInfo(inviteInfo)
        }
      }
    } catch (e) { /* Error silencioso para saltar a canales */ }

    if (info) {
      const mentions = (res?.participants || inviteInfo?.participants || []).map(p => p.id)
      await client.sendMessage(m.chat, { 
        text: info, 
        contextInfo: {
          mentionedJid: mentions,
          externalAdReply: {
            title: "📻 Inspector Alastor",
            body: "Sintonizando la verdad...",
            thumbnailUrl: pp || thumb,
            sourceUrl: text,
            mediaType: 1
          }
        }
      }, { quoted: m })
    } else {
      // Intento de inspección de Canal (Newsletter)
      const channelUrl = text?.match(/(?:https:\/\/)?(?:www\.)?(?:chat\.|wa\.)?whatsapp\.com\/channel\/([0-9A-Za-z]{22,24})/i)?.[1]
      if (channelUrl) {
        try {
          const newsletterInfo = await client.newsletterMetadata("invite", channelUrl)
          let caption = "📻 🎙️ *𝗜𝗡𝗦𝗣𝗘𝗖𝗖𝗜𝗢𝗡 𝗗𝗘 𝗖𝗔𝗡𝗔𝗟* 🎙️ 📻\n\n" + processNewsletter(newsletterInfo)
          pp = newsletterInfo?.preview ? getUrlFromDirectPath(newsletterInfo.preview) : thumb
          
          await client.sendMessage(m.chat, { 
            text: caption, 
            contextInfo: {
              externalAdReply: {
                title: "📻 Radio Channel Inspector",
                body: "Analizando la señal...",
                thumbnailUrl: pp,
                sourceUrl: text,
                mediaType: 1
              }
            }
          }, { quoted: m })
        } catch (e) {
          m.reply(`📻 *¡CRASH!* La frecuencia del canal está muerta o es inaccesible. ♪`)
        }
      } else {
        m.reply(`🎙️ *¡Atención!* Necesito un enlace válido de grupo o canal para empezar mi show. ♪`)
      }
    }
  }
}

// --- Helpers ---
function formatDate(n) {
  const date = new Date(n > 1e12 ? n : n * 1000)
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function processNewsletter(obj) {
  const keys = {
    id: "🆔 Identificador",
    state: "📌 Estado",
    creation_time: "📅 Primera Emisión",
    name: "🏷️ Nombre",
    description: "📜 Guion",
    subscribers: "👥 Oyentes"
  }
  let caption = ""
  for (const key in keys) {
    if (obj[key]) {
      let val = obj[key]
      if (key === 'creation_time') val = formatDate(val)
      caption += `*${keys[key]}:*\n> ${val}\n`
    }
  }
  return caption
}
