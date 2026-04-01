import fetch from 'node-fetch'

export default {
  command: ['instagram', 'ig'],
  category: 'downloader',
  run: async (client, m, args, usedPrefix, command) => {
    // Validación de argumentos (sin desestructuración)
    if (!args || !args[0]) {
      return m.reply('🎙️ *¡Sintonizando frecuencias!* Pero necesito un enlace de Instagram para empezar la función, querido amigo. ♪')
    }

    if (!args[0].match(/instagram\.com\/(p|reel|share|tv|stories)\//)) {
      return m.reply('📻 *¡Vaya interferencia!* Ese enlace no parece tener la clase de *Instagram*. ¡Asegúrate de que sea el correcto! ¡Jajaja!')
    }

    try {
      const data = await getInstagramMedia(args[0])
      
      if (!data || !data.url) {
        return m.reply('🍎 *¡Qué decepción!* Mis sombras no han podido extraer ese bocado visual. ¿Quizás la señal está... muerta?')
      }
      
      const caption =
        `📻 🎙️  *𝗧𝗥𝗔𝗡𝗦𝗠𝗜𝗦𝗜𝗢𝗡 𝗗𝗘 𝗜𝗡𝗦𝗧𝗔𝗚𝗥𝗔𝗠* 🎙️ 📻\n\n` +
        `${data.title ? `🎩 ➔ *Sujeto* › ${data.title}\n` : ''}` +
        `${data.caption ? `📜 ➔ *Crónica* › ${data.caption}\n` : ''}` +
        `${data.like ? `❤️ ➔ *Aplausos* › ${data.like}\n` : ''}` +
        `${data.comment ? `💬 ➔ *Críticas* › ${data.comment}\n` : ''}` +
        `${data.views ? `👁️ ➔ *Audiencia* › ${data.views}\n` : ''}` +
        `${data.duration ? `⏳ ➔ *Duración* › ${data.duration}\n` : ''}` +
        `${data.resolution ? `📺 ➔ *Definición* › ${data.resolution}\n` : ''}` +
        `${data.format ? `🎞️ ➔ *Celuloide* › ${data.format}\n` : ''}` +
        `🎵 ➔ *Frecuencia* › ${args[0].split('?')[0]}\n\n` + // Limpiamos la URL para el caption
        `*¡El entretenimiento es la moneda del alma!*`

      if (data.type === 'video') {
        await client.sendMessage(m.chat, { 
          video: { url: data.url }, 
          caption, 
          mimetype: 'video/mp4', 
          fileName: 'radio_demon_ig.mp4' 
        }, { quoted: m })
      } else if (data.type === 'image') {
        await client.sendMessage(m.chat, { 
          image: { url: data.url }, 
          caption 
        }, { quoted: m })
      } else {
        throw new Error('Contenido aburrido... ¡Digo, no soportado!')
      }
    } catch (e) {
      console.error(e)
      await m.reply(`📻 *¡CRASH!* La estática se apodera de la señal... \n> [Error de transmisión: *${e.message}*]\n¡El espectáculo debe continuar! ♪`)
    }
  }
}

async function getInstagramMedia(url) {
  const apis = [
    { endpoint: `${global.APIs.stellar.url}/dl/instagram?url=${encodeURIComponent(url)}&key=${global.APIs.stellar.key}`, extractor: res => {
        if (!res.status || !Array.isArray(res.data) || !res.data.length) return null
        const media = res.data[0]
        if (!media?.url) return null
        return { type: media.tipo === 'video' ? 'video' : 'image', title: null, caption: null, resolution: null, format: media.tipo === 'video' ? 'mp4' : 'jpg', url: media.url }
      }
    },
    { endpoint: `${global.APIs.stellar.url}/dl/instagramv2?url=${encodeURIComponent(url)}&key=${global.APIs.stellar.key}`, extractor: res => {
        if (!res.status || !res.data?.url) return null
        const mediaUrl = res.data.mediaUrls?.[0] || res.data.url
        return { type: res.data.type === 'video' ? 'video' : 'image', title: res.data.username || null, caption: res.data.caption || null, resolution: null, format: res.data.type === 'video' ? 'mp4' : 'jpg', url: mediaUrl, duration: res.data.videoMeta?.duration ? `${Math.round(res.data.videoMeta.duration)}s` : null }
      }
    },
    { endpoint: `${global.APIs.nekolabs.url}/downloader/instagram?url=${encodeURIComponent(url)}`, extractor: res => {
        if (!res.success || !res.result?.downloadUrl?.length) return null
        const mediaUrl = res.result.downloadUrl[0]
        return { type: res.result.metadata?.isVideo ? 'video' : 'image', title: res.result.metadata?.username || null, caption: res.result.metadata?.caption || null, like: res.result.metadata?.like || null, format: res.result.metadata?.isVideo ? 'mp4' : 'jpg', url: mediaUrl }
      }
    },
    { endpoint: `${global.APIs.delirius.url}/download/instagram?url=${encodeURIComponent(url)}`, extractor: res => {
        if (!res.status || !Array.isArray(res.data) || !res.data.length) return null
        const media = res.data[0]
        return { type: media.type === 'video' ? 'video' : 'image', title: null, caption: null, format: media.type === 'video' ? 'mp4' : 'jpg', url: media.url }
      }
    }
  ]

  for (const { endpoint, extractor } of apis) {
    try {
      const res = await fetch(endpoint).then(r => r.json())
      const result = extractor(res)
      if (result && result.url) return result
    } catch {}
    await new Promise(r => setTimeout(r, 600))
  }
  return null
}
