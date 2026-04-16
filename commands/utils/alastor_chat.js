// 📻 RADIO ALASTOR - VERSIÓN FINAL DE SINTONÍA
export default {
    command: ['alastor'],
    category: 'fun',
    
    run: async (client, m, { text }) => {
        if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
        const chat = global.db.data.chats[m.chat]

        // Limpieza profunda del texto para evitar fallos de lectura
        const input = text ? text.toLowerCase().trim() : ''

        if (input === 'on' || input.includes('on')) {
            chat.alastorIA = true
            return m.reply(`📻 *¡SINTONIZANDO LA FRECUENCIA DEL CAOS!* 🎙️\n\nLa transmisión ha comenzado, mi querido Productor Ejecutivo **Emmax**. ¡Esto será un espectáculo sádicamente divertido! Jajajaja.`)
        } 
        
        if (input === 'off' || input.includes('off')) {
            chat.alastorIA = false
            return m.reply(`🎙️ *CORTE DE SEÑAL* 📻\n\nLa radio se apaga por ahora. No se olviden de sonreír... ¡nunca están totalmente vestidos sin una!`)
        }

        // Ayuda visual limpia
        const help = `📻 *RADIO ALASTOR: ESTADO DE LA SEÑAL* 🎙️\n\n` +
                     `¿Buscas entretenimiento, pecador?\n\n` +
                     `> Usa: */alastor on* para encender.\n` +
                     `> Usa: */alastor off* para apagar.`
        
        m.reply(help)
    },

    before: async (m, { client, conn }) => {
        if (!global.db.data.chats[m.chat]) return false
        const chat = global.db.data.chats[m.chat]
        
        // Reglas de oro para no responder cuando no debe
        if (!chat.alastorIA || m.isBaileys || m.fromMe || !m.text) return false
        if (/^[./#]/.test(m.text)) return false // Ignora otros comandos

        try {
            // Instrucción Maestra para la IA (Basada en Gemini)
            const alastorPrompt = `Eres Alastor de Hazbin Hotel. Tu interlocutor principal es Emmax (tu productor). Sé sofisticado, sádico, usa jerga de radio de los años 30 y mantén siempre la elegancia. Puedes usar insultos leves como "saco de pulgas" o "maldito infeliz" si te molestan. Responde de forma breve y con estilo de radio. Usuario: ${m.text}`

            // IMPORTANTE: Verifica si tu bot usa 'conn.getChatAI', 'conn.gemini' o 'conn.replyIA'
            // Si el bot no responde nada al hablarle, cambia 'getChatAI' por la función que uses para la IA.
            const response = await conn.getChatAI(alastorPrompt) 

            const finalReply = `📻 *RADIO ALASTOR:* 🎙️\n\n${response}\n\n> _¡Sigan en sintonía!_ ♪`

            await client.sendMessage(m.chat, { text: finalReply }, { quoted: m })
            return true

        } catch (e) {
            return false
        }
    }
}
