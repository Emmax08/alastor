import yts from 'yt-search'
import fetch from 'node-fetch'
import { getBuffer } from '../../lib/message.js'

const isYTUrl = (url) => /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i.test(url)

export default {
  command: ['play2', 'mp4', 'ytmp4', 'ytvideo', 'playvideo'],
  category: 'downloader',
  run: async (client, m, args, usedPrefix, command) => {
    try {
      // Unimos los argumentos para obtener la búsqueda o URL
      const text = args ? args.join(' ') : ''

      if (!text) {
        return m.reply('🎙️ *¡Sintonizando frecuencias!* Pero necesito el nombre o la URL de ese espectáculo visual para empezar la función. ♪')
      }

      // Detectar si es una URL de YouTube para extraer el ID
      const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
      const query = videoMatch ? 'https://youtu.be/' + videoMatch[1] : text
      
      let url = query
      let title = 'Video'
      let thumbBuffer = null
      
      try {
        const search = await yts(query)
        if (search && search.all && search.all.length) {
          const videoInfo = videoMatch ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0] : search.all[0]
          
          if (videoInfo) {
            url = videoInfo.url
            title = videoInfo.title
            thumbBuffer = await getBuffer(videoInfo.image)
            const vistas = (videoInfo.views || 0).toLocaleString()
            const canal = videoInfo.author?.name || 'Desconocido'
            
            const infoMessage = `📻 🎙️  *𝗘𝗦𝗣𝗘𝗖𝗧𝗔𝗖𝗨𝗟𝗢 𝗩𝗜𝗦𝗨𝗔𝗨𝗟* 🎙️ 📻\n\n` +
              `🎞️ ➔ *Título* › *${title}*\n` +
              `🎩 ➔ *Productor* › *${canal}*\n` +
              `⏳ ➔ *Duración* › *${videoInfo.timestamp || 'Desconocido'}*\n` +
              `👁️ ➔ *Audiencia* › *${vistas}*\n` +
              `📅 ➔ *Emisión* › *${videoInfo.ago || 'Desconocido'}*\n` +
              `🔗 ➔ *Frecuencia* › *${url}*\n\n` +
              `*¡Prepárate para la función, querido!*`
              
            await client.sendMessage(m.chat, { image: thumbBuffer, caption: infoMessage }, { quoted: m })
          }
        }
      } catch (err) {
        console.error("Error en yt-search:", err)
      }

      // Intentar obtener el enlace de descarga de video
      const video = await getVideoFromApis(url)
      
      if (!video || !video.url) {
        return m.reply('🍎 *¡Vaya interferencia!* No he podido capturar el celuloide. ¡Qué falta de clase! Intenta más tarde.')
      }

      // Obtener el buffer del video
      const videoBuffer = await getBuffer(video.url)
      
      if (!videoBuffer) throw new Error("Buffer de video vacío.")

      // Enviar el video
      await client.sendMessage(m.chat, { 
        video: videoBuffer, 
        fileName: `${title}.mp4`, 
        mimetype: 'video/mp4',
        caption: `*Aquí tienes tu bocado visual, ¡disfrútalo!* ♪`
      }, { quoted: m })

    } catch (e) {
      console.error(e)
      await m.reply(`📻 *¡CRASH!* La estática se apodera de la señal... \n> [Error de transmisión: *${e.message}*]\n¡El espectáculo debe continuar! ♪`)
    }
  }
}

async function getVideoFromApis(url) {
  const apis = [
    { api: 'Axi', endpoint: `${global.APIs.axi.url}/down/ytvideo?url=${encodeURIComponent(url)}`, extractor: res => res?.resultado?.url_dl },        
    { api: 'Vreden', endpoint: `${global.APIs.vreden.url}/api/v1/download/youtube/video?url=${encodeURIComponent(url)}&quality=360`, extractor: res => res.result?.download?.url },
    { api: 'Stellar', endpoint: `${global.APIs.stellar.url}/dl/ytdl?url=${encodeURIComponent(url)}&format=mp4&key=${global.APIs.stellar.key}`, extractor: res => res.result?.download },
    { api: 'Nekolabs', endpoint: `${global.APIs.nekolabs.url}/downloader/youtube/v1?url=${encodeURIComponent(url)}&format=360`, extractor: res => res.result?.downloadUrl },
    { api: 'Vreden v2', endpoint: `${global.APIs.vreden.url}/api/v1/download/play/video?query=${encodeURIComponent(url)}`, extractor: res => res.result?.download?.url }
  ]

  for (const { api, endpoint, extractor } of apis) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000) // 15 segundos por intento
      
      const res = await fetch(endpoint, { signal: controller.signal }).then(r => r.json())
      clearTimeout(timeout)
      
      const link = extractor(res)
      if (link) return { url: link, api }
    } catch (e) {
      // Si falla, pasa a la siguiente API en la lista
    }
    await new Promise(resolve => setTimeout(resolve, 400))
  }
  return null
}
