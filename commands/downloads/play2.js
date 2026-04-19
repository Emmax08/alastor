import axios from 'axios';
import yts from 'yt-search';

const API_KEY = "causa-ee5ee31dcfc79da4";
const BASE_API = "https://rest.apicausas.xyz/api/v1/descargas/youtube";

export default {
    command: ['video', 'ytmp4', 'playvideo'],
    category: 'downloader',
    run: async (client, m, args) => {
        try {
            const text = args ? args.join(' ') : '';
            if (!text) return m.reply('🎬 *¡Luces, cámara!* Necesito un nombre o URL del video.');

            await m.reply('🔍 *Buscando y procesando video...*');

            const search = await yts(text);
            const video = search.videos[0];
            if (!video) return m.reply('🍎 No encontré el video.');

            // Llamada a la API forzando VIDEO
            const { data: apiResponse } = await axios.get(BASE_API, {
                params: { apikey: API_KEY, url: video.url, type: 'video' }
            });

            if (!apiResponse.status) throw new Error("API Error");

            const response = await axios({
                method: 'get',
                url: apiResponse.data.download.url,
                responseType: 'arraybuffer'
            });

            const videoBuffer = Buffer.from(response.data);

            // Envío del video
            await client.sendMessage(m.chat, {
                video: videoBuffer,
                mimetype: 'video/mp4',
                fileName: `${video.title}.mp4`,
                caption: `🎬 *𝗩𝗜𝗗𝗘𝗢 𝗗𝗜𝗚𝗜𝗧𝗔𝗟*\n\n📌 *Título:* ${video.title}\n🎩 *Canal:* ${video.author.name}\n⏳ *Duración:* ${video.timestamp}`
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            await m.reply(`❌ *Error al procesar el video.*`);
        }
    }
}
