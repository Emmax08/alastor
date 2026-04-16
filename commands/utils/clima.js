import axios from 'axios';

export default {
    command: ['clima', 'weather', 'tiempo'],
    category: 'utils',
    run: async (client, m, args, usedPrefix, command, text) => {
        if (!text) return m.reply(`📻 *RADIO ALASTOR: INFORME DEL TIEMPO* 🎙️\n\nSintonía incorrecta. Indica una ciudad o país.\n\n> *Ejemplo:* ${usedPrefix + command} México`);

        try {
            // Llamada a wttr.in con formato JSON detallado
            const response = await axios.get(`https://wttr.in/${encodeURIComponent(text)}?format=j1&lang=es`);
            const data = response.data;

            const current = data.current_condition[0];
            const loc = data.nearest_area[0];
            const forecast = data.weather; // Aquí vienen los días solicitados

            let report = `📻 *INFORME METEOROLÓGICO: ${loc.areaName[0].value.toUpperCase()}* 🎙️\n`;
            report += `> _Ubicación: ${loc.region[0].value}, ${loc.country[0].value}_\n\n`;
            
            report += `🌡️ *Estado Actual:* ${current.lang_es[0].value}\n`;
            report += `🌡️ *Temperatura:* ${current.temp_C}°C (Sensación: ${current.feelsLikeC}°C)\n`;
            report += `💧 *Humedad:* ${current.humidity}%\n`;
            report += `💨 *Viento:* ${current.windspeedKmph} km/h\n\n`;

            report += `📅 *PRONÓSTICO (3 DÍAS):*\n`;
            
            // Mapeamos los 3 días que pediste
            forecast.forEach((day, index) => {
                const date = day.date;
                report += `*${index === 0 ? 'Hoy' : date}:* 🔼${day.maxtempC}°C / 🔽${day.mintempC}°C (${day.hourly[4].lang_es[0].value})\n`;
            });

            report += `\n> _Sintonizando el clima para tu supervivencia... ♪_`;

            await client.sendMessage(m.chat, { 
                text: report,
                contextInfo: {
                    externalAdReply: {
                        title: `CLIMA: ${loc.areaName[0].value}`,
                        body: `Sintonizando la frecuencia meteorológica...`,
                        thumbnailUrl: 'https://files.catbox.moe/d2b1e8.jpg', 
                        sourceUrl: 'https://github.com/Emmax08',
                        mediaType: 1,
                        showAdAttribution: true
                    }
                }
            }, { quoted: m });

        } catch (error) {
            console.error(error);
            m.reply(`🎙️ *INTERFERENCIA EN LA SEÑAL* 📻\n\nNo pude localizar esa zona. Intenta ser más específico con el nombre.`);
        }
    }
};
