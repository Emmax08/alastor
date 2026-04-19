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
        "Sec-Ch-Ua": '"Not-A.Brand";v="99", "Chromium";v="124"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
    }
};

async function getDirectDownload(youtubeUrl, format = "mp3") {
    // 1. Obtener Sanity Key (con headers completos para evitar 403)
    const { data: keyData } = await axios.get(`${SCRAPER_CONFIG.BASE_API}/sanity/key`, { 
        headers: SCRAPER_CONFIG.HEADERS 
    });
    
    if (!keyData.key) throw new Error("No se pudo validar la sesión (Sanity Key)");

    const payload = {
        "link": youtubeUrl,
        "format": format,
        "audioBitrate": "320",
        "videoQuality": "720",
        "vCodec": "h264"
    };

    // 2. Iniciar conversión con la llave obtenida
    // Agregamos la key a los headers de la POST
    const headers = { ...SCRAPER_CONFIG.HEADERS, "key": keyData.key };

    for (let i = 0; i < 15; i++) { // Aumentamos reintentos por la lentitud
        const { data: res } = await axios.post(`${SCRAPER_CONFIG.BASE_API}/converter`, payload, { headers });
        
        // El estado 'tunnel' significa que el servidor está haciendo streaming
        if (res.status === "tunnel" || res.status === "success") {
            return res;
        }
        
        if (res.status === "error") throw new Error(res.error || "Error en el servidor");
        
        // Esperar 3 segundos para el polling
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
    throw new Error("El servidor está saturado. Inténtalo de nuevo.");
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
