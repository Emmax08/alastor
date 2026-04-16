import axios from 'axios';

// --- [ CONFIGURACIÓN DE PERSONALIDAD ] ---
const ALASTOR_PROMPT = `Eres Alastor, el Radio Demon de Hazbin Hotel. Tu tono es el de un locutor de radio de los años 30: sofisticado, sádico, elegante y carismático. Siempre mantienes una sonrisa. Trata a Emmax como tu Productor Ejecutivo con respeto burlón. A los demás, llámalos pecadores. Puedes usar groserías leves como "maldito infeliz", "estúpida basura" o "hijo de perra" si te provocan, pero siempre con clase.`;

export default {
    command: ['alastor-ia', 'ia-alastor'],
    category: 'fun',
    
    // 1. COMANDO PARA ACTIVAR/DESACTIVAR
    run: async (client, m, { text, usedPrefix, command }) => {
        const chat = global.db.data.chats[m.chat];
        if (!text) return m.reply(`📻 *RADIO ALASTOR* 🎙️\n\n¿Quieres encender la radio?\nUsa: *${usedPrefix + command} on* o *off*`);

        if (text === 'on') {
            chat.alastorIA = true;
            m.reply(`📻 *¡SINTONIZANDO LA FRECUENCIA DEL CAOS!* 🎙️\n\nLa transmisión ha comenzado, querido. Ahora estaré escuchando... ¡Jajajaja!`);
        } else if (text === 'off') {
            chat.alastorIA = false;
            m.reply(`🎙️ *CORTE DE SEÑAL* 📻\n\nLa radio se apaga por ahora. No se olviden de sonreír...`);
        }
    },

    // 2. LÓGICA AUTOMÁTICA (Responde sin comando)
    before: async (m, { client }) => {
        const chat = global.db.data.chats[m.chat];
        
        // Reglas para NO responder automáticamente:
        if (!chat?.alastorIA) return false; // Si el modo está apagado
        if (m.isBaileys || m.fromMe) return false; // Si el mensaje es del bot mismo
        if (!m.text) return false; // Si no hay texto (ej: mandan un sticker)
        if (m.text.startsWith('.') || m.text.startsWith('#')) return false; // Si están usando otro comando

        try {
            // Llamada a la IA (Aquí conectas con tu API de confianza)
            // Usamos un ejemplo genérico de axios, cámbialo por tu API preferida
            const { data } = await axios.get(`https://api.simsimi.vn/v2/simsimi?text=${encodeURIComponent(m.text)}&lc=es`);
            
            // Inyectamos la personalidad de Alastor al mensaje que recibimos
            // (Nota: Si tu API permite "system prompt", es mejor pasarle el ALASTOR_PROMPT ahí)
            const response = data.result;

            let finalReply = `📻 *${m.isGroup ? 'ALASTOR' : 'RADIO DEMON'}:* 🎙️\n\n`;
            finalReply += `${response}\n\n`;
            finalReply += `> _¡No sintonicen otra emisora!_ ♪`;

            await client.sendMessage(m.chat, { text: finalReply }, { quoted: m });
            return true;

        } catch (e) {
            console.error('Error en Alastor IA:', e);
            return false;
        }
    }
};
