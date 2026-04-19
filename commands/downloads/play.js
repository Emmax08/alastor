import axios from 'axios';
import yts from 'yt-search';

const API_KEY = "causa-ee5ee31dcfc79da4";
const BASE_API = "https://rest.apicausas.xyz/api/v1/descargas/youtube";

export default {
    command: ['play', 'mp3', 'ytmp3', 'ytaudio'],
    category: 'downloader',
    run: async (client, m, args) => {
        try {
            const text = args ? args.join(' ') : '';
            if (!text) return m.reply('🎙️ *¡Sintonizando frecuencias!* Necesito un nombre o URL.');

            await m.reply('🔍 *Buscando y procesando audio...*');

            const search = await yts(text);
            const video = search.videos[0];
            if (!video) return m.reply('🍎 No encontré esa canción.');

            // Llamada a la API forzando AUDIO
            const { data: apiResponse } = await axios.get(BASE_API, {
                params: { apikey: API_KEY, url: video.url, type: 'audio' }
            });

            if (!apiResponse.status) throw new Error("API Error");

            const response = await axios({
                method: 'get',
                url: apiResponse.data.download.url,
                responseType: 'arraybuffer'
            });

            const audioBuffer = Buffer.from(response.data);

            // Información y envío
            await client.sendMessage(m.chat, {
                image: { url: video.thumbnail },
                caption: `📻 *𝗠𝗨𝗦𝗜𝗖𝗔 𝗗𝗜𝗚𝗜𝗧𝗔𝗟*\n\n📌 *Título:* ${video.title}\n⏳ *Duración:* ${video.timestamp}\n🔗 *Link:* ${video.url}`
            }, { quoted: m });

            await client.sendMessage(m.chat, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                fileName: `${video.title}.mp3`
            }, { quoted: m });

        } catch (e) {
            console.error(e);
            await m.reply(`❌ *Error en la transmisión de audio.*`);
        }
    }
}
