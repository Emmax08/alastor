import axios from 'axios';

export default {
    command: ['clima', 'weather', 'tiempo'],
    category: 'utils',
    run: async (client, m, args, usedPrefix, command, text) => {
        if (!text) return m.reply(`📻 *RADIO ALASTOR: INFORME DEL TIEMPO* 🎙️\n\nIndica una ciudad o país.\n\n> *Ejemplo:* ${usedPrefix + command} México`);

        try {
            const response = await axios.get(`https://wttr.in/${encodeURIComponent(text)}?format=j1&lang=es`);
            const data = response.data;
            
            if (!data || !data.current_condition) return m.reply('❌ No se encontraron datos para esa ubicación.');

            const current = data.current_condition[0];
            const loc = data.nearest_area[0];
            const forecast = data.weather;

            let report = `📻 *INFORME: ${loc.areaName[0].value.toUpperCase()}* 🎙️\n\n`;
            
            report += `🌡️ *Estado:* ${current.lang_es ? current.lang_es[0].value : current.weatherDesc[0].value}\n`;
            report += `🌡️ *Temp:* ${current.temp_C}°C\n`;
            report += `💧 *Humedad:* ${current.humidity}%\n`;
            report += `💨 *Viento:* ${current.windspeedKmph} km/h\n\n`;

            report += `📅 *PRONÓSTICO:* \n`;
            forecast.slice(0, 3).forEach((day) => {
                report += `• *${day.date}:* ${day.maxtempC}° / ${day.mintempC}°\n`;
            });

            report += `\n> _Sintonizando para tu supervivencia... ♪_`;

            // En iPhone, a veces el thumbnail muy pesado bloquea el mensaje.
            // He simplificado el contextInfo para máxima compatibilidad.
            await client.sendMessage(m.chat, { 
                text: report,
                contextInfo: {
                    externalAdReply: {
                        title: `CLIMA: ${loc.areaName[0].value}`,
                        body: `Temperatura actual: ${current.temp_C}°C`,
                        previewType: "PHOTO",
                        thumbnailUrl: 'https://files.catbox.moe/d2b1e8.jpg',
                        containsAutoReply: true,
                        renderLargerThumbnail: false, // IMPORTANTE: En false para que cargue mejor en iOS
                        showAdAttribution: true,
                        sourceUrl: 'https://github.com/Emmax08'
                    }
                }
            }, { quoted: m });

        } catch (error) {
            console.error('Error en clima:', error);
            // Si el mensaje con imagen falla, enviamos solo texto para que el usuario no se quede sin respuesta
            m.reply(`🎙️ *CLIMA: ${text.toUpperCase()}* 📻\n\nHubo un error con la señal visual, pero aquí tienes los datos básicos o intenta de nuevo.`);
        }
    }
};
