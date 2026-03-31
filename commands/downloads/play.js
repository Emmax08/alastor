import yts from 'yt-search'
import fetch from 'node-fetch'
import { getBuffer } from '../../lib/message.js'

const isYTUrl = (url) => /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i.test(url)

async function getVideoInfo(query, videoMatch) {
  const search = await yts(query)
  if (!search || !search.all || !search.all.length) return null
  const videoInfo = videoMatch ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0] : search.all[0]
  return videoInfo || null
}

export default {
  command: ['play', 'mp3', 'ytmp3', 'ytaudio', 'playaudio'],
  category: 'downloader',
  // Se cambió la estructura de los parámetros a petición:
  run: async (client, m, args, usedPrefix, command) => { 
    try {
      // Unimos los argumentos para procesar la búsqueda o URL
      const text = args ? args.join(' ') : ''
      
      if (!text) {
        return m.reply('🎙️ *¡Sintonizando frecuencias!* Pero necesito el nombre o la URL de esa melodía para empezar la función. ♪')
      }

      const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
      const query = videoMatch ? 'https://youtu.be/' + videoMatch[1] : text
      
      let url = query
      let title = 'Audio'
      let thumbBuffer = null
      
      // Intentar obtener información visual del video
      try {
        const videoInfo = await getVideoInfo(query, videoMatch)
        if (videoInfo) {
          url = videoInfo.url
          title = videoInfo.title
          thumbBuffer = await getBuffer(videoInfo.image)
          const vistas = (videoInfo.views || 0).toLocaleString()
          const canal = videoInfo.author?.name || 'Desconocido'
          
          const infoMessage = `📻 🎙️  *𝗧𝗥𝗔𝗡𝗦𝗠𝗜𝗦𝗜𝗢𝗡 𝗠𝗨𝗦𝗜𝗖𝗔𝗟* 🎙️ 📻\n\n` +
            `📻 ➔ *Melodía* › ${title}\n` +
            `🎩 ➔ *Productor* › *${canal}*\n` +
            `⏳ ➔ *Duración* › *${videoInfo.timestamp || 'Desconocido'}*\n` +
            `👁️ ➔ *Audiencia* › *${vistas}*\n` +
            `📅 ➔ *Lanzamiento* › *${videoInfo.ago || 'Desconocido'}*\n` +
            `🔗 ➔ *Frecuencia* › *${url}*\n\n` +
            `*¡Disfruta del espectáculo, querido!*`
            
          await client.sendMessage(m.chat, { image: thumbBuffer, caption: infoMessage }, { quoted: m })
        }
      } catch (err) {
        console.error("Error en yt-search:", err)
      }

      // Intentar obtener el enlace de descarga de las APIs
      const audio = await getAudioFromApis(url)
      
      if (!audio || !audio.url) {
        return m.reply('🍎 *¡Vaya interferencia!* No he podido capturar el audio. Intenta más tarde, querido.')
      }

      const audioBuffer = await getBuffer(audio.url)
      
      if (!audioBuffer) throw new Error("Buffer de audio vacío.")

      // Envío del archivo de audio final
      await client.sendMessage(m.chat, { 
        audio: audioBuffer, 
        fileName: `${title}.mp3`, 
        mimetype: 'audio/mpeg' 
      }, { quoted: m })

    } catch (e) {
      console.error(e)
      await m.reply(`📻 *¡CRASH!* La estática se apodera de la señal... \n> [Error: *${e.message}*]`)
    }
  }
}

// Función para rotar entre múltiples APIs de descarga
async function getAudioFromApis(url) {
  const apis = [
    { api: 'Axi', endpoint: `${global.APIs.axi.url}/down/ytaudio?url=${encodeURIComponent(url)}`, extractor: res => res?.resultado?.url_dl },    
    { api: 'Ootaizumi', endpoint: `${global.APIs.ootaizumi.url}/downloader/youtube/play?query=${encodeURIComponent(url)}`, extractor: res => res.result?.download },
    { api: 'Vreden', endpoint: `${global.APIs.vreden.url}/api/v1/download/youtube/audio?url=${encodeURIComponent(url)}&quality=256`, extractor: res => res.result?.download?.url },
    { api: 'Stellar', endpoint: `${global.APIs.stellar.url}/dl/ytdl?url=${encodeURIComponent(url)}&format=mp3&key=${global.APIs.stellar.key}`, extractor: res => res.result?.download },
    { api: 'Ootaizumi v2', endpoint: `${global.APIs.ootaizumi.url}/downloader/youtube?url=${encodeURIComponent(url)}&format=mp3`, extractor: res => res.result?.download },
    { api: 'Nekolabs', endpoint: `${global.APIs.nekolabs.url}/downloader/youtube/v1?url=${encodeURIComponent(url)}&format=mp3`, extractor: res => res.result?.downloadUrl }
  ]

  for (const { api, endpoint, extractor } of apis) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000) // 15 seg de espera
      
      const res = await fetch(endpoint, { signal: controller.signal }).then(r => r.json())
      clearTimeout(timeout)
      
      const link = extractor(res)
      if (link) return { url: link, api }
    } catch (e) {
      // Continuar a la siguiente API si esta falla
    }
    await new Promise(resolve => setTimeout(resolve, 300))
  }
  return null
}
