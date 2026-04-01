import yts from 'yt-search';
import { getBuffer } from '../../lib/message.js';

export default {
  command: ['ytsearch', 'search'],
  category: 'internet',
  // Se quitan los {} para recibir los parámetros directamente en orden
  run: async (client, m, args, usedPrefix, command) => {
    // Verificamos que args sea un array y tenga contenido
    if (!args || !args[0]) {
      return m.reply('🎙️ *¡Sintonizando frecuencias!* Pero necesito el título de un espectáculo para empezar la función. ♪')
    }
    
    try {
      const text = args.join(" ")
      const ress = await yts(text)
      const armar = ress.all
      
      if (!armar || armar.length === 0) {
        return m.reply('🍎 *¡Qué decepción!* Mis sombras no han encontrado nada en este rincón del infierno.')
      }

      // Intentamos obtener la imagen del primer resultado
      const firstResult = armar[0]
      const Ibuff = await getBuffer(firstResult.image || firstResult.thumbnail || 'https://i.imgur.com/8N7CHRh.png')
      
      let teks2 = armar.map((v) => {
        switch (v.type) {
          case 'video':
            return `📻 🎙️  *𝗧𝗥𝗔𝗡𝗦𝗠𝗜𝗦𝗜𝗢𝗡 𝗩𝗜𝗦𝗨𝗔𝗟* 🎙️ 📻\n\n` +
                   `🎞️ ➔ *Espectáculo* › *${v.title}*\n` +
                   `⏳ ➔ *Duración* › ${v.timestamp}\n` +
                   `📅 ➔ *Emisión* › ${v.ago}\n` +
                   `👁️ ➔ *Audiencia* › ${v.views.toLocaleString()}\n` +
                   `🔗 ➔ *Frecuencia* › ${v.url}`.trim()
          case 'channel':
            return `📻 🎙️  *𝗖𝗔𝗡𝗔𝗟 𝗗𝗘 𝗘𝗠𝗜𝗦𝗜𝗢𝗡* 🎙️ 📻\n\n` +
                   `🎩 ➔ *Productor* › *${v.name}*\n` +
                   `🔗 ➔ *Frecuencia* › ${v.url}\n` +
                   `👥 ➔ *Audiencia* › ${v.subCountLabel || 'N/A'}\n` +
                   `🎞️ ➔ *Producciones* › ${v.videoCount || 'N/A'}`.trim()
          default:
            return null
        }
      }).filter((v) => v).slice(0, 10).join('\n\n╾۪〬─ ┄۫╌ ׄ┄┈۪ ─〬 ׅ┄╌ ۫┈ ─ׄ─۪〬 ┈ ┄۫╌ ┈┄۪ ─ׄ〬╼\n\n')

      await client.sendMessage(m.chat, { 
        image: Ibuff, 
        caption: teks2 + `\n\n*¡Sonríe, el mundo te está observando!*` 
      }, { quoted: m })

    } catch (e) {
      console.error(e)
      await m.reply(`📻 *¡CRASH!* La estática se apodera de la señal... \n> [Error: *${e.message}*]\n¡El espectáculo debe continuar! ♪`)
    }
  },
};
