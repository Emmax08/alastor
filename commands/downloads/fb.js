import fetch from 'node-fetch'

export default {
  command: ['fb', 'facebook'],
  category: 'downloader',
  run: async (client, m, args, usedPrefix, command) => {
    // Validación de argumentos lineal
    if (!args || !args[0]) {
      return m.reply('🎙️ *¡Sintonizando frecuencias!* Pero necesito un enlace de Facebook para empezar la función, querido. ♪')
    }

    if (!args[0].match(/facebook\.com|fb\.watch|video\.fb\.com/)) {
      return m.reply('📻 *¡Vaya interferencia!* Ese enlace no tiene la clase necesaria. ¡Asegúrate de que sea un link de Facebook válido! ¡Jajaja!')
    }

    try {
      const data = await getFacebookMedia(args[0])
      
      if (!data || !data.url) {
        return m.reply('🍎 *¡Qué decepción!* Mis sombras no han podido extraer ese bocado visual. ¿Quizás la señal está... muerta?')
      }
      
      const caption =
        `📻 🎙️  *𝗧𝗥𝗔𝗡𝗦𝗠𝗜𝗦𝗜𝗢𝗡 𝗗𝗘 𝗙𝗔𝗖𝗘𝗕𝗢𝗢𝗞* 🎙️ 📻\n\n` +
        `${data.title ? `🎞️ ➔ *Espectáculo* › ${data.title}\n` : ''}` +
        `${data.resolution ? `📺 ➔ *Definición* › ${data.resolution}\n` : ''}` +
        `${data.format ? `🎞️ ➔ *Celuloide* › ${data.format}\n` : ''}` +
        `${data.duration ? `⏳ ➔ *Duración* › ${data.duration}\n` : ''}` +
        `🎵 ➔ *Frecuencia* › ${args[0].split('?')[0]}\n\n` +
        `*¡El entretenimiento es la moneda del alma!*`

      if (data.type === 'video') {
        await client.sendMessage(m.chat, { 
          video: { url: data.url }, 
          caption, 
          mimetype: 'video/mp4', 
          fileName: 'radio_demon_fb.mp4' 
        }, { quoted: m })
      } else if (data.type === 'image') {
        await client.sendMessage(m.chat, { 
          image: { url: data.url }, 
          caption 
        }, { quoted: m })
      } else {
        throw new Error('Contenido no soportado.')
      }
    } catch (e) {
      console.error(e)
      await m.reply(`📻 *¡CRASH!* La estática se apodera de la señal... \n> [Error de transmisión: *${e.message}*]\n¡No te preocupes, el espectáculo debe continuar! ♪`)
    }
  }
}

async function getFacebookMedia(url) {
  const apis = [
    { 
      endpoint: `${global.APIs.stellar.url}/dl/facebook?url=${encodeURIComponent(url)}&key=${global.APIs.stellar.key}`, 
      extractor: res => {
        if (!res.status || !Array.isArray(res.resultados)) return null
        const hd = res.resultados.find(x => x.quality?.toLowerCase().includes('hd') || x.quality?.includes('720'))
        const sd = res.resultados.find(x => x.quality?.toLowerCase().includes('sd') || x.quality?.includes('360'))
        const media = hd || sd || res.resultados[0]
        if (!media?.url) return null
        return { type: 'video', title: null, resolution: media.quality || 'N/A', format: 'mp4', url: media.url }
      }
    },
    { 
      endpoint: `${global.APIs.vreden.url}/api/v1/download/facebook?url=${encodeURIComponent(url)}`, 
      extractor: res => {
        if (!res.status || !res.result?.download) return null
        const urlVideo = res.result.download.hd || res.result.download.sd
        if (!urlVideo) return null
        return { 
          type: 'video', 
          title: res.result.title || null, 
          resolution: res.result.download.hd ? 'HD' : 'SD', 
          format: 'mp4', 
          url: urlVideo, 
          duration: res.result.durasi || null 
        }
      }
    },
    { 
      endpoint: `${global.APIs.delirius.url}/download/facebook?url=${encodeURIComponent(url)}`, 
      extractor: res => {
        if (!res.status || !res.urls) return null
        const hd = res.urls.find(x => x.hd)?.hd
        const sd = res.urls.find(x => x.sd)?.sd
        const urlVideo = hd || sd
        if (!urlVideo) return null
        return { type: 'video', title: res.title || null, resolution: hd ? 'HD' : 'SD', format: 'mp4', url: urlVideo }
      }
    }
  ]

  for (const { endpoint, extractor } of apis) {
    try {
      const res = await fetch(endpoint).then(r => r.json())
      const result = extractor(res)
      if (result && result.url) return result
    } catch (e) {
      // Siguiente API si esta falla
    }
    await new Promise(r => setTimeout(r, 600))
  }
  return null
}
