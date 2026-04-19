import axios from 'axios';
import yts from 'yt-search';

// Configuración del motor de descarga (extraído de tus archivos python/HAR)
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
 * Lógica del Scraper para obtener el link de descarga
 */
async function getDirectDownload(youtubeUrl, format = "mp3") {
    // 1. Obtener Sanity Key
    const { data: keyData } = await axios.get(`${SCRAPER_CONFIG.BASE_API}/sanity/key`, { 
        headers: SCRAPER_CONFIG.HEADERS 
    });
    
    const payload = {
        "link": youtubeUrl,
        "format": format,
        "audioBitrate": "320",
        "videoQuality": "720",
        "vCodec": "h264"
    };

    const headers = { ...SCRAPER_CONFIG.HEADERS, "key": keyData.key };

    // 2. Iniciar conversión y Polling
    for (let i = 0; i < 10; i++) {
        const { data: res } = await axios.post(`${SCRAPER_CONFIG.BASE_API}/converter`, payload, { headers });
        
        if (res.status === "tunnel" || res.status === "success") {
            return res;
        }
        
        if (res.status === "error") throw new Error(res.error || "Error en el servidor");
        
        // Esperar 3 segundos antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
    throw new Error("El servidor de descarga no respondió a tiempo.");
}

export default {
    command: ['play', 'mp3', 'ytmp3', 'ytaudio', 'playaudio'],
    category: 'downloader',
    run: async (client, m, args, usedPrefix, command) => {
        try {
            const text = args ? args.join(' ') : '';
            if (!text) return m.reply('🎙️ *¡Sintonizando frecuencias!* Pero necesito el nombre o la URL para empezar la función. ♪');

            await m.reply('🔍 *Buscando melodía... por favor espere.*');

            // 1. Búsqueda con yt-search
            const search = await yts(text);
            const video = search.videos[0];
            if (!video) return m.reply('🍎 No encontré esa melodía, querido.');

            // 2. Obtener link de descarga usando el Scraper de y2meta
            const downloadData = await getDirectDownload(video.url, "mp3");

            // 3. Información visual
            const infoMessage = `📻 🎙️ *𝗧𝗥𝗔𝗡𝗦𝗠𝗜𝗦𝗜𝗢𝗡 𝗠𝗨𝗦𝗜𝗖𝗔𝗟* 🎙️ 📻\n\n` +
                `📻 ➔ *Melodía* › ${video.title}\n` +
                `🎩 ➔ *Productor* › *${video.author.name}*\n` +
                `⏳ ➔ *Duración* › *${video.timestamp}*\n` +
                `🔗 ➔ *Frecuencia* › *YouTube*\n\n` +
                `*¡Enviando archivo de audio de alta fidelidad!*`;

            await client.sendMessage(m.chat, {
                image: { url: video.thumbnail },
                caption: infoMessage
            }, { quoted: m });

            // 4. Enviar el archivo de audio directamente
            await client.sendMessage(m.chat, {
                audio: { url: downloadData.url },
                mimetype: 'audio/mpeg',
                fileName: `${video.title}.mp3`
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            await m.reply(`📻 *¡CRASH!* La estática se apodera de la señal...\n> [Error: *${e.message}*]`);
        }
    }
}
