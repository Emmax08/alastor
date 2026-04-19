import axios from 'axios'
import yts from 'yt-search'
import { getBuffer } from '../../lib/message.js'

// Configuración del motor de descarga (extraído de tus archivos)
const SCRAPER_CONFIG = {
    BASE_API: "https://api.mp3youtube.cc/v2",
    HEADERS: {
        "Content-Type": "application/json",
        "Origin": "https://iframe.y2meta-uk.com",
        "Referer": "https://iframe.y2meta-uk.com/",
        "Accept": "*/*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
    }
};

/**
 * Lógica del Scraper para obtener el link de descarga de Video
 */
async function getDirectVideoDownload(youtubeUrl) {
    // 1. Obtener Sanity Key
    const { data: keyData } = await axios.get(`${SCRAPER_CONFIG.BASE_API}/sanity/key`, { 
        headers: SCRAPER_CONFIG.HEADERS 
    });
    
    const payload = {
        "link": youtubeUrl,
        "format": "mp4",
        "audioBitrate": "128",
        "videoQuality": "720", // Intentamos 720p por defecto
        "vCodec": "h264"
    };

    const headers = { ...SCRAPER_CONFIG.HEADERS, "key": keyData.key };

    // 2. Polling para esperar la conversión del video
    for (let i = 0; i < 15; i++) {
        const { data: res } = await axios.post(`${SCRAPER_CONFIG.BASE_API}/converter`, payload, { headers });
        
        if (res.status === "tunnel" || res.status === "success") {
            return res.url;
        }
        
        if (res.status === "error") throw new Error(res.error || "Error en el servidor");
        
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
    return null;
}

export default {
  command: ['play2', 'mp4', 'ytmp4', 'ytvideo', 'playvideo'],
  category: 'downloader',
  run: async (client, m, args, usedPrefix, command) => {
    try {
      const text = args ? args.join(' ') : ''
      if (!text) return m.reply('🎙️ *¡Sintonizando frecuencias!* Pero necesito el nombre o la URL de ese espectáculo visual para empezar la función. ♪')

      const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
      const query = videoMatch ? 'https://youtu.be/' + videoMatch[1] : text
      
      let url = query
      let title = 'Video'
      
      // 1. Búsqueda con yt-search
      const search = await yts(query)
      if (!search || !search.all.length) return m.reply('🍎 No encontré esa melodía, querido.')
      
      const videoInfo = videoMatch ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0] : search.all[0]
      url = videoInfo.url
      title = videoInfo.title

      const infoMessage = `📻 🎙️  *𝗘𝗦𝗣𝗘𝗖𝗧𝗔𝗖𝗨𝗟𝗢 𝗩𝗜𝗦𝗨𝗔𝗨𝗟* 🎙️ 📻\n\n` +
        `🎞️ ➔ *Título* › *${title}*\n` +
        `🎩 ➔ *Productor* › *${videoInfo.author?.name || 'Desconocido'}*\n` +
        `⏳ ➔ *Duración* › *${videoInfo.timestamp || 'Desconocido'}*\n` +
        `👁️ ➔ *Audiencia* › *${(videoInfo.views || 0).toLocaleString()}*\n` +
        `🔗 ➔ *Frecuencia* › *YouTube*\n\n` +
        `*¡Enviando el celuloide, aguarde un momento!*`
        
      await client.sendMessage(m.chat, { 
          image: { url: videoInfo.image }, 
          caption: infoMessage 
      }, { quoted: m })

      // 2. Obtener link de descarga directo usando el scraper
      const videoUrl = await getDirectVideoDownload(url)
      
      if (!videoUrl) {
        return m.reply('🍎 *¡Vaya interferencia!* El servidor de descarga no respondió. Intenta más tarde.')
      }

      // 3. Enviar el video directamente desde la URL (Baileys maneja el buffer automáticamente)
      await client.sendMessage(m.chat, { 
        video: { url: videoUrl }, 
        fileName: `${title}.mp4`, 
        mimetype: 'video/mp4',
        caption: `*Aquí tienes tu bocado visual, ¡disfrútalo!* ♪`
      }, { quoted: m })

    } catch (e) {
      console.error(e)
      await m.reply(`📻 *¡CRASH!* La estática se apodera de la señal...\n> [Error: *${e.message}*]`)
    }
  }
}
