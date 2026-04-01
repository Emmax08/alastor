import { search, download } from 'aptoide-scraper'
import { getBuffer } from "../../lib/message.js"

export default {
  command: ['apk', 'aptoide', 'apkdl'],
  category: 'download',
  run: async (client, m, args, usedPrefix, command) => {
    // Validación de argumentos sin llaves {}
    if (!args || !args.length) {
      return m.reply('🎙️ *¡Sintonizando frecuencias!* Pero necesito el nombre de una aplicación para empezar la función, querido. ♪')
    }

    const query = args.join(' ').trim()
    
    try {
      // Iniciamos la búsqueda en las sombras de Aptoide
      const searchResults = await search(query)
      
      if (!searchResults || searchResults.length === 0) {
        return m.reply('🍎 *¡Qué decepción!* Mis sombras no han encontrado ese artefacto en este rincón del infierno.')
      }
      
      // Extraemos la información del primer resultado
      const apkInfo = await download(searchResults[0].id)
      
      if (!apkInfo || !apkInfo.dllink) {
        return m.reply('📻 *¡Vaya interferencia!* No he podido extraer la información de esa aplicación. ¿Quizás el archivo está... muerto?')
      }

      const { name, package: pkgId, size, icon, dllink: downloadUrl, lastup } = apkInfo
      
      const caption = `📻 🎙️  *𝗘𝗡𝗧𝗥𝗘𝗚𝗔 𝗗𝗘 𝗔𝗣𝗟𝗜𝗖𝗔𝗖𝗜𝗢𝗡* 🎙️ 📻\n\n` +
        `📦 ➔ *Artefacto* › ${name}\n` +
        `🆔 ➔ *Paquete* › ${pkgId}\n` +
        `📅 ➔ *Última Emisión* › ${lastup || 'Desconocida'}\n` +
        `⚖️ ➔ *Peso del Alma* › ${size}\n\n` +
        `*¡El entretenimiento es la moneda del alma!*`

      // Verificación de peso (Límite de 500MB aprox para evitar crashes)
      const sizeBytes = parseSize(size)
      if (sizeBytes > 524288000) { 
        return m.reply(`📻 *¡Demasiado pesado!* Ese archivo es un bocado demasiado grande para mis sombras (${size}).\n\n> *Descárgalo tú mismo aquí:* \n${downloadUrl}`)
      }

      // Enviamos el documento APK
      await client.sendMessage(m.chat, { 
        document: { url: downloadUrl }, 
        mimetype: 'application/vnd.android.package-archive', 
        fileName: `${name}.apk`, 
        caption 
      }, { quoted: m })

    } catch (e) {
      console.error(e)
      await m.reply(`📻 *¡CRASH!* La estática se apodera de la señal... \n> [Error de transmisión: *${e.message}*]\n¡No te preocupes, el espectáculo debe continuar! ♪`)
    }
  },
}

// Función auxiliar para calcular el peso del archivo
function parseSize(sizeStr) {
  if (!sizeStr) return 0
  const parts = sizeStr.trim().toUpperCase().split(/\s+/)
  const value = parseFloat(parts[0])
  const unit = parts[1] || 'B'
  
  switch (unit) {
    case 'KB': case 'K': return value * 1024
    case 'MB': case 'M': return value * 1024 * 1024
    case 'GB': case 'G': return value * 1024 * 1024 * 1024
    default: return value
  }
}
