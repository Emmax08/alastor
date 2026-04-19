import axios from 'axios';
import yts from 'yt-search';

const SCRAPER_CONFIG = {
    BASE_API: "https://api.mp3youtube.cc/v2",
    HEADERS: {
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "es-419,es;q=0.9",
        "Origin": "https://iframe.y2meta-uk.com",
        "Referer": "https://iframe.y2meta-uk.com/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    }
};

/**
 * Lógica del Scraper con Polling mejorado
 */
async function getDirectDownload(youtubeUrl, format = "mp3") {
    // 1. Obtener Sanity Key
    const { data: keyData } = await axios.get(`${SCRAPER_CONFIG.BASE_API}/sanity/key`, { 
        headers: SCRAPER_CONFIG.HEADERS 
    });
    
    if (!keyData.key) throw new Error("No se pudo validar la sesión.");

    const payload = {
        "link": youtubeUrl,
        "format": format,
        "audioBitrate": "320",
        "videoQuality": "720",
        "vCodec": "h264"
    };

    const headers = { ...SCRAPER_CONFIG.HEADERS, "key": keyData.key };

    // 2. Polling: Reintentar hasta que el túnel esté listo
    for (let i = 0; i < 15; i++) {
        const { data: res } = await axios.post(`${SCRAPER_CONFIG.BASE_API}/converter`, payload, { headers });
        
        if (res.status === "tunnel" || res.status === "success") {
            return res; // Retorna el objeto con la URL del túnel
        }
        
        if (res.status === "error") throw new Error(res.error || "Error en conversión");
        
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
    throw new Error("Tiempo de espera agotado.");
}

export default {
    command: ['play', 'mp3', 'ytmp3', 'ytaudio', 'playaudio'],
    category: 'downloader',
    run: async (client, m, args, usedPrefix, command) => {
        try {
            const text = args ? args.join(' ') : '';
            if (!text) return m.reply('🎙️ *¡Sintonizando frecuencias!* Necesito un nombre o URL.');

            await m.reply('🔍 *Buscando y procesando... esto puede demorar un poco debido a la señal.*');

            // 1. Búsqueda
            const search = await yts(text);
            const video = search.videos[0];
            if (!video) return m.reply('🍎 No encontré esa melodía.');

            // 2. Obtener la URL del túnel de streaming
            const downloadData = await getDirectDownload(video.url, "mp3");

            // 3. Descargar el Stream a un Buffer (ESTO SOLUCIONA LA LENTITUD)
            // Esperamos a que el servidor de y2meta termine de enviarnos los datos
            const response = await axios({
                method: 'get',
                url: downloadData.url,
                responseType: 'arraybuffer',
                headers: SCRAPER_CONFIG.HEADERS,
                timeout: 300000 // 5 minutos de margen para audios largos
            });

            const audioBuffer = Buffer.from(response.data);

            // 4. Información visual
            const infoMessage = `📻 🎙️ *𝗧𝗥𝗔𝗡𝗦𝗠𝗜𝗦𝗜𝗢𝗡 𝗠𝗨𝗦𝗜𝗖𝗔𝗟* 🎙️ 📻\n\n` +
                `📻 ➔ *Melodía* › ${video.title}\n` +
                `🎩 ➔ *Productor* › *${video.author.name}*\n` +
                `⏳ ➔ *Duración* › *${video.timestamp}*\n` +
                `🔗 ➔ *Frecuencia* › *YouTube*\n\n` +
                `*¡Archivo de alta fidelidad procesado con éxito!*`;

            await client.sendMessage(m.chat, {
                image: { url: video.thumbnail },
                caption: infoMessage
            }, { quoted: m });

            // 5. Enviar el Buffer de audio
            await client.sendMessage(m.chat, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                fileName: `${video.title}.mp3`
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            await m.reply(`📻 *¡CRASH!* Error en la transmisión.\n> [Detalle: *${e.message}*]`);
        }
    }
}
