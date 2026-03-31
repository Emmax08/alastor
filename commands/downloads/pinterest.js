import fetch from 'node-fetch'

export default {
  command: ['pinterest', 'pin'],
  category: 'search',
  run: async (client, m, { args, command, usedPrefix }) => {
    const text = args.join(' ')
    const isPinterestUrl = /^https?:\/\//.test(text)
    
    if (!text) {
      return m.reply('🎙️ *¡Sintonizando frecuencias!* Pero me temo que necesito un término de búsqueda o un enlace para empezar la función, querido amigo. ♪')
    }
    
    try {
      if (isPinterestUrl) {
        const data = await getPinterestDownload(text)
        if (!data) return m.reply('📻 *¡Vaya, interferencia!* No he podido extraer ese bocado visual. ¿Quizás el enlace está... muerto? ¡Jajaja!')
        
        const caption = `📻 🎙️  *𝗧𝗥𝗔𝗡𝗦𝗠𝗜𝗦𝗜𝗢𝗡 𝗗𝗘 𝗣𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧* 📻 🎙️\n\n` + 
          `${data.title ? `📻 ➔ *Espectáculo* › ${data.title}\n` : ''}` + 
          `${data.description ? `📜 ➔ *Crónica* › ${data.description}\n` : ''}` + 
          `${data.author ? `🎩 ➔ *Productor* › ${data.author}\n` : ''}` + 
          `${data.username ? `👤 ➔ *Sujeto* › ${data.username}\n` : ''}` + 
          `${data.followers ? `👥 ➔ *Audiencia* › ${data.followers}\n` : ''}` + 
          `${data.uploadDate ? `📅 ➔ *Fecha de Emisión* › ${data.uploadDate}\n` : ''}` + 
          `${data.likes ? `❤️ ➔ *Aplausos* › ${data.likes}\n` : ''}` + 
          `${data.comments ? `💬 ➔ *Críticas* › ${data.comments}\n` : ''}` + 
          `${data.views ? `👁️ ➔ *Espectadores* › ${data.views}\n` : ''}` + 
          `${data.saved ? `📌 ➔ *Archivado* › ${data.saved}\n` : ''}` + 
          `${data.format ? `🎞️ ➔ *Celuloide* › ${data.format}\n` : ''}` + 
          `🎵 ➔ *Frecuencia* › ${text}\n\n` +
          `*¡El entretenimiento es la moneda del alma!*`

        if (data.type === 'video') {
          await client.sendMessage(m.chat, { video: { url: data.url }, caption, mimetype: 'video/mp4', fileName: 'radio_demon.mp4' }, { quoted: m })
        } else if (data.type === 'image') {
          await client.sendMessage(m.chat, { image: { url: data.url }, caption }, { quoted: m })
        } else {
          throw new Error('Contenido aburrido... ¡Digo, no soportado!')
        }
      } else {
        const results = await getPinterestSearch(text)
        if (!results || results.length === 0) {
          return m.reply(`🍎 *¡Qué decepción!* Mis sombras no han encontrado nada sobre *${text}* en este rincón del infierno.`)
        }
        
        const medias = results.slice(0, 10).map(r => ({ 
          type: r.type === 'video' ? 'video' : 'image', 
          data: { url: r.image }, 
          caption: `📻 🎙️  *𝗚𝗔𝗟𝗘𝗥𝗜𝗔 𝗗𝗘𝗟 𝗗𝗘𝗠𝗢𝗡𝗜𝗢* 🎙️ 📻\n\n` + 
            `${r.title ? `🎙️ ➔ *Título* › ${r.title}\n` : ''}` + 
            `${r.description ? `📜 ➔ *Descripción* › ${r.description}\n` : ''}` + 
            `${r.name ? `🎩 ➔ *Autor* › ${r.name}\n` : ''}` + 
            `${r.username ? `👤 ➔ *Usuario* › ${r.username}\n` : ''}` + 
            `${r.followers ? `👥 ➔ *Seguidores* › ${r.followers}\n` : ''}` + 
            `${r.likes ? `❤️ ➔ *Likes* › ${r.likes}\n` : ''}` + 
            `${r.created_at ? `📅 ➔ *Registro* › ${r.created_at}\n` : ''}` +
            `\n*¡Sonríe, el mundo te está observando!*`
        }))
        await client.sendAlbumMessage(m.chat, medias, { quoted: m })
      }
    } catch (e) {
      await m.reply(`📻 *¡CRASH!* La estática se apodera de la señal... \n> [Transmisión interrumpida: *${e.message}*]\n¡No te preocupes, querido! ¡Estamos trabajando en ello! ♪`)
    }
  }
}

// ... Las funciones getPinterestDownload y getPinterestSearch se mantienen igual
