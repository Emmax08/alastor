// 📻 RADIO ALASTOR - PLUGIN DE CHAT AUTOMÁTICO
export default {
    command: ['alastor'],
    category: 'fun',
    
    run: async (client, m, { text }) => {
        // Inicializamos la base de datos para este chat si no existe
        if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
        const chat = global.db.data.chats[m.chat]

        // Limpiamos el texto para evitar errores de lectura
        const instruction = text ? text.toLowerCase().trim() : ''

        if (instruction === 'on') {
            chat.alastorIA = true
            return m.reply(`📻 *¡SINTONIZANDO LA FRECUENCIA DEL CAOS!* 🎙️\n\nLa transmisión ha comenzado, mi querido Productor Ejecutivo **Emmax**. ¡Esto será un espectáculo sádicamente divertido! Jajajaja.`)
        } 
        
        if (instruction === 'off') {
            chat.alastorIA = false
            return m.reply(`🎙️ *CORTE DE SEÑAL* 📻\n\nLa radio se apaga por ahora. No se olviden de sonreír... ¡nunca están totalmente vestidos sin una!`)
        }

        // Si no pone on/off, damos una ayuda limpia sin NaN
        m.reply(`📻 *RADIO ALASTOR: ESTADO DE LA SEÑAL* 🎙️\n\n¿Buscas entretenimiento, pecador?\n\n> Usa: */alastor on* para encender.\n> Usa: */alastor off* para apagar.`)
    },

    before: async (m, { client, conn }) => {
        if (!global.db.data.chats[m.chat]) return false
        const chat = global.db.data.chats[m.chat]
        
        // Solo responde si el modo está ON y es un mensaje de texto válido
        if (!chat.alastorIA || m.isBaileys || m.fromMe || !m.text) return false
        
        // Ignoramos si es un comando (empieza con / . #)
        if (/^[./#]/.test(m.text)) return false

        try {
            // El Prompt Maestro: Aquí es donde me convierto en Alastor para ti
            const promptAlastor = `Instrucciones: Eres Alastor de Hazbin Hotel (El Radio Demon). Habla con elegancia de los años 30, carisma sádico y un tono de locutor de radio refinado. IMPORTANTE: Tu interlocutor es Emmax, tu Productor Ejecutivo, tratálo con respeto burlón. Si alguien te provoca, usa groserías leves pero con clase (ej: pedazo de basura, maldito infeliz). Nunca dejes de sonreír. Usuario dice: ${m.text}`

            // Llamada a la IA del bot (Asegúrate de que 'conn.getChatAI' exista en tu base)
            const response = await conn.getChatAI(promptAlastor) 

            let finalReply = `📻 *RADIO ALASTOR:* 🎙️\n\n`
            finalReply += `${response}\n\n`
            finalReply += `> _¡Manténganse sintonizados!_ ♪`

            await client.sendMessage(m.chat, { text: finalReply }, { quoted: m })
            return true

        } catch (e) {
            console.error('Error en la transmisión de Alastor:', e)
            return false
        }
    }
}
