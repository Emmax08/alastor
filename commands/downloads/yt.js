import yts from 'yt-search';
import {getBuffer} from '../../lib/message.js';

export default {
  command: ['ytsearch', 'search'],
  category: 'internet',
  run: async (client, m, { args, usedPrefix, command }) => {
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

      const Ibuff = await getBuffer(armar[0].image || armar[0].thumbnail)
      
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
                   `👥 ➔ *Audiencia* › ${v.subCountLabel}\n` +
                   `🎞️ ➔ *Producciones* › ${v.videoCount}`.trim()
        }
      }).filter((v) => v).join('\n\n╾۪〬─ ┄۫╌ ׄ┄┈۪ ─〬 ׅ┄╌ ۫┈ ─ׄ─۪〬 ┈ ┄۫╌ ┈┄۪ ─ׄ〬╼\n\n')

      await client.sendMessage(m.chat, { 
        image: Ibuff, 
        caption: teks2 + `\n\n*¡Sonríe, el mundo te está observando!*` 
      }, { quoted: m })

    } catch (e) {
      await m.reply(`📻 *¡CRASH!* La estática se apodera de la señal... \n> [Error de transmisión: *${e.message}*]\n¡No te preocupes, el espectáculo debe continuar! ♪`)
    }
  },
};
