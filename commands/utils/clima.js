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

            report += `📅 *PRONÓSTICO PRÓXIMOS DÍAS:* \n`;
            forecast.slice(0, 3).forEach((day) => {
                report += `• *${day.date}:* ${day.maxtempC}° / ${day.mintempC}°\n`;
            });

            report += `\n> _Sintonizando para tu supervivencia... ♪_`;

            // Enviamos solo el texto, sin imágenes ni URLs de previsualización
            await client.sendMessage(m.chat, { text: report }, { quoted: m });

        } catch (error) {
            console.error('Error en clima:', error);
            m.reply(`🎙️ *INTERFERENCIA EN LA SEÑAL* 📻\n\nNo se pudo obtener el clima para "${text}". Intenta de nuevo.`);
        }
    }
};
