import os from 'os';

function rTime(seconds) {
  seconds = Number(seconds)
  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor((seconds % (3600 * 24)) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const dDisplay = d > 0 ? d + (d === 1 ? " día, " : " días, ") : ""
  const hDisplay = h > 0 ? h + (h === 1 ? " hora, " : " horas, ") : ""
  const mDisplay = m > 0 ? m + (m === 1 ? " minuto, " : " minutos, ") : ""
  const sDisplay = s > 0 ? s + (s === 1 ? " segundo" : " segundos") : ""
  return dDisplay + hDisplay + mDisplay + sDisplay
}

export default {
  command: ['infobot', 'infosocket'],
  category: 'info',
  run: async (client, m, { usedPrefix, command }) => {
    const botId = client.user.id.split(':')[0] + "@s.whatsapp.net"
    const botSettings = global.db.data.settings[botId] || {}
    const botname = botSettings.botname || 'Radio Demon'
    const namebot = botSettings.namebot || 'Alastor'
    const monedas = botSettings.currency || 'Coins'
    const banner = botSettings.banner
    const prefijo = botSettings.prefix
    const owner = botSettings.owner
    const canalId = botSettings.id
    const canalName = botSettings.nameid
    const link = botSettings.link

    let desar = 'Oculto'
    if (owner && !isNaN(owner.replace(/@s\.whatsapp\.net$/, ''))) {
      const userData = global.db.data.users[owner]
      desar = userData?.genre || 'Oculto'
    }

    const platform = os.type()
    const now = new Date()
    // Ajustado para dar esa sensación de puntualidad británica o mexicana, según prefieras
    const localTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }))
    const nodeVersion = process.version
    const sistemaUptime = rTime(os.uptime())
    const uptime = process.uptime()
    const uptimeDate = new Date(localTime.getTime() - uptime * 1000)
    
    const formattedUptimeDate = uptimeDate.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/^./, str => str.toUpperCase())

    const isOficialBot = botId === global.client.user.id.split(':')[0] + "@s.whatsapp.net"
    const botType = isOficialBot ? 'Emisora Principal' : 'Repetidora de Señal'

    try {
      const message = `📻 🎙️  *𝗕𝗢𝗟𝗘𝗧𝗜𝗡 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗩𝗢* 🎙️ 📻\n\n` +
        `¡Saludos, queridos oyentes! Aquí los detalles de nuestra transmisión:\n\n` +
        `🎭 *𝗘𝗻𝘁𝗶𝗱𝗮𝗱 ›* ${botname}\n` +
        `🎙️ *𝗔𝗹𝗶𝗮𝘀 ›* ${namebot}\n` +
        `⚖️ *𝗗𝗶վ𝗶𝘀𝗮 ›* ${monedas}\n` +
        `🎼 *𝗦𝗶𝗻𝘁𝗼𝗻𝗶́𝗮 ›* ${prefijo === true ? '`Sin prefijos`' : (Array.isArray(prefijo) ? prefijo : [prefijo || '/']).map(p => `\`${p}\``).join(', ')}\n\n` +
        `⚙️ *𝗠𝗮𝗾𝘂𝗶𝗻𝗮𝗿𝗶𝗮:*\n` +
        `➔ *Tipo ›* ${botType}\n` +
        `➔ *Plataforma ›* ${platform}\n` +
        `➔ *Motor ›* Node.js ${nodeVersion}\n` +
        `➔ *Al aire desde ›* ${formattedUptimeDate}\n` +
        `➔ *Estabilidad ›* ${sistemaUptime}\n` +
        `➔ *${desar === 'Hombre' ? 'Dueño' : desar === 'Mujer' ? 'Dueña' : 'Dueño(a)'} ›* ${owner ? (!isNaN(owner.replace(/@s\.whatsapp\.net$/, '')) ? `@${owner.split('@')[0]}` : owner) : "Un caballero guarda sus secretos"}\n\n` +
        `📻 *Canal:* ${link}\n\n` +
        `*¡El entretenimiento es la moneda del alma!* ♪`.trim()

      await client.sendMessage(m.chat, banner.includes('.mp4') || banner.includes('.webm') ? {
        video: { url: banner },
        gifPlayback: true,
        caption: message,
        contextInfo: {
          mentionedJid: [owner, m.sender],
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: canalId,
            serverMessageId: '',
            newsletterName: canalName
          }
        }
      } : {
        text: message,
        contextInfo: {
          mentionedJid: [owner, m.sender],
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: canalId,
            serverMessageId: '',
            newsletterName: canalName
          },
          externalAdReply: {
            title: `📻 ${botname} - Frecuencia Infernal`,
            body: `Transmitiendo en Node.js ${nodeVersion}`,
            showAdAttribution: false,
            thumbnailUrl: banner,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m });

    } catch (e) {
      return m.reply(`📻 *¡CRASH!* La estática se apodera de la señal... \n> [Error: *${e.message}*]\n¡Sonríe, esto es solo interferencia! ♪`)
    }
  }
};
