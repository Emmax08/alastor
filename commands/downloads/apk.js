import { search, download } from 'aptoide-scraper'
import { getBuffer } from "../../lib/message.js"

export default {
  command: ['apk', 'aptoide', 'apkdl'],
  category: 'download',
  run: async (client, m, { args, usedPrefix, command }) => {
    if (!args || !args.length) {
      return m.reply('🎙️ *¡Sintonizando frecuencias!* Pero necesito el nombre de una aplicación para empezar la función, querido. ♪')
    }
    const query = args.join(' ').trim()
    try {
      const searchA = await search(query)
      if (!searchA || searchA.length === 0) {
        return m.reply('🍎 *¡Qué decepción!* Mis sombras no han encontrado ese artefacto en este rincón del infierno.')
      }
      
      const apkInfo = await download(searchA[0].id)
      if (!apkInfo) {
        return m.reply('📻 *¡Vaya interferencia!* No he podido extraer la información de esa aplicación. ¿Quizás el archivo está... muerto?')
      }

      const { name, package: id, size, icon, dllink: downloadUrl, lastup } = apkInfo
      
      const caption = `📻 🎙️  *𝗘𝗡𝗧𝗥𝗘𝗚𝗔 𝗗𝗘 𝗔𝗣𝗟𝗜𝗖𝗔𝗖𝗜𝗢𝗡* 🎙️ 📻\n\n` +
        `📦 ➔ *Artefacto* › ${name}\n` +
        `🆔 ➔ *Paquete* › ${id}\n` +
        `📅 ➔ *Última Emisión* › ${lastup}\n` +
        `⚖️ ➔ *Peso del Alma* › ${size}\n\n` +
        `*¡El entretenimiento es la moneda del alma!*`

      const sizeBytes = parseSize(size)
      if (sizeBytes > 524288000) {
        return m.reply(`📻 *¡Demasiado pesado!* Ese archivo es un bocado demasiado grande para mis sombras (${size}).\n\n> *Descárgalo tú mismo aquí:* \n${downloadUrl}`)
      }

      await client.sendMessage(m.chat, { 
        document: { url: downloadUrl }, 
        mimetype: 'application/vnd.android.package-archive', 
        fileName: `${name}.apk`, 
        caption 
      }, { quoted: m })

     } catch (e) {
      await m.reply(`📻 *¡CRASH!* La estática se apodera de la señal... \n> [Error de transmisión: *${e.message}*]\n¡No te preocupes, el espectáculo debe continuar! ♪`)
    }
  },
}

function parseSize(sizeStr) {
  if (!sizeStr) return 0
  const parts = sizeStr.trim().toUpperCase().split(' ')
  const value = parseFloat(parts[0])
  const unit = parts[1] || 'B'
  switch (unit) {
    case 'KB': return value * 1024
    case 'MB': return value * 1024 * 1024
    case 'GB': return value * 1024 * 1024 * 1024
    default: return value
  }
}
