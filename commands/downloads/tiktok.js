import fetch from 'node-fetch';

export default {
  command: ['tiktok', 'tt', 'tiktoksearch', 'ttsearch', 'tts'],
  category: 'downloader',
  run: async (client, m, args, usedPrefix, command) => {
    // Validación de argumentos (args ahora es el array directamente)
    if (!args || args.length === 0) {
      return m.reply(`🎙️ *¡Sintonizando frecuencias!* Pero necesito un término de búsqueda o un enlace de TikTok para empezar la función. ♪`)
    }

    const text = args.join(" ")
    const isUrl = /(?:https:?\/{2})?(?:w{3}|vm|vt|t)?\.?tiktok.com\/([^\s&]+)/gi.test(text)
    
    // Construcción del endpoint usando las globales
    const endpoint = isUrl 
      ? `${global.APIs.stellar.url}/dl/tiktok?url=${encodeURIComponent(text)}&key=${global.APIs.stellar.key}` 
      : `${global.APIs.stellar.url}/search/tiktok?query=${encodeURIComponent(text)}&key=${global.APIs.stellar.key}`
    
    try {
      const res = await fetch(endpoint)
      if (!res.ok) throw new Error(`El servidor respondió con ${res.status}`)
      const json = await res.json()
      
      if (!json.status || !json.data) {
        return m.reply('📻 *¡Vaya interferencia!* No he podido encontrar contenido válido en este rincón del infierno.')
      }

      if (isUrl) {
        // Lógica para descarga de URL directa
        const { title, duration, dl, author, stats, created_at, type } = json.data
        if (!dl || (Array.isArray(dl) && dl.length === 0)) {
          return m.reply('🍎 *¡Qué decepción!* Un enlace inválido o sin contenido que valga la pena transmitir.')
        }
        
        const caption = `📻 🎙️  *𝗧𝗥𝗔𝗡𝗦𝗠𝗜𝗦𝗜𝗢𝗡 𝗗𝗘 𝗧𝗜𝗞𝗧𝗢𝗞* 🎙️ 📻\n\n` +
          `🎞️ ➔ *Espectáculo* › ${title || 'Sin título'}\n` +
          `🎩 ➔ *Productor* › ${author?.nickname || author?.unique_id || 'Desconocido'}\n` +
          `⏳ ➔ *Duración* › ${duration || 'N/A'}\n` +
          `❤️ ➔ *Aplausos* › ${(stats?.likes || 0).toLocaleString()}\n` +
          `💬 ➔ *Críticas* › ${(stats?.comments || 0).toLocaleString()}\n` +
          `👁️ ➔ *Audiencia* › ${(stats?.views || stats?.plays || 0).toLocaleString()}\n` +
          `📅 ➔ *Emisión* › ${created_at || 'N/A'}\n\n` +
          `*¡El entretenimiento es la moneda del alma!*`

        if (type === 'image') {
          const medias = dl.map(url => ({ type: 'image', data: { url }, caption }))
          await client.sendAlbumMessage(m.chat, medias, { quoted: m })
          
          // Intento de obtener audio para el carrusel
          try {
            const audioRes = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(text)}`)
            const audioJson = await audioRes.json()
            if (audioJson?.data?.play) {
              await client.sendMessage(m.chat, { audio: { url: audioJson.data.play }, mimetype: 'audio/mp4', fileName: 'tiktok_audio.mp3' }, { quoted: m })
            }
          } catch (e) { /* Silencio en la radio */ }
        } else {
          const videoUrl = Array.isArray(dl) ? dl[0] : dl
          await client.sendMessage(m.chat, { video: { url: videoUrl }, caption }, { quoted: m })
        }

      } else {
        // Lógica para búsqueda (Search)
        const validResults = json.data.filter(v => v.dl)
        if (!validResults || validResults.length < 1) {
          return m.reply('📻 *¡Poca audiencia!* No he encontrado resultados para esa búsqueda.')
        }

        const medias = validResults.slice(0, 10).map(v => {
          const caption = `📻 🎙️  *𝗚𝗔𝗟𝗘𝗥𝗜𝗔 𝗗𝗘𝗟 𝗗𝗘𝗠𝗢𝗡𝗜𝗢* 🎙️ 📻\n\n` +
            `🎞️ ➔ *Título* › ${v.title || 'Sin título'}\n` +
            `🎩 ➔ *Autor* › ${v.author?.nickname || 'Desconocido'}\n` +
            `⏳ ➔ *Duración* › ${v.duration || 'N/A'}\n` +
            `❤️ ➔ *Likes* › ${(v.stats?.likes || 0).toLocaleString()}\n` +
            `👁️ ➔ *Vistas* › ${(v.stats?.views || 0).toLocaleString()}\n\n` +
            `*¡Sonríe, el mundo te está observando!*`
          return { type: 'video', data: { url: v.dl }, caption }
        })
        
        await client.sendAlbumMessage(m.chat, medias, { quoted: m })
      }
    } catch (e) {
      console.error(e)
      await m.reply(`📻 *¡CRASH!* La estática se apoderera de la señal... \n> [Error: *${e.message}*]`)
    }
  }
}
