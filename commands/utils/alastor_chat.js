// Este comando usa la base de Gemini (yo) con la personalidad de Alastor
export default {
    command: ['alastor'],
    category: 'fun',
    
    // 1. INTERRUPTOR DE LA TRANSMISIÓN
    run: async (client, m, { text, usedPrefix, command }) => {
        if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
        const chat = global.db.data.chats[m.chat]

        if (!text) return m.reply(`📻 *RADIO ALASTOR* 🎙️\n\n¿Quieres encender la radio, pecador?\nUsa: *${usedPrefix + command} on* o *off*`)

        if (text === 'on') {
            chat.alastorIA = true
            m.reply(`📻 *¡SINTONIZANDO LA FRECUENCIA DEL CAOS!* 🎙️\n\nLa transmisión ha comenzado. Pónganse cómodos, ¡esto será un espectáculo! Jajajaja.`)
        } else if (text === 'off') {
            chat.alastorIA = false
            m.reply(`🎙️ *CORTE DE SEÑAL* 📻\n\nLa radio se apaga por ahora. No se olviden de sonreír, ¡nunca están totalmente vestidos sin una!`)
        }
    },

    // 2. CHAT CONTINUO (Basado en Gemini/IA del Bot)
    before: async (m, { client, conn }) => {
        if (!global.db.data.chats[m.chat]) return false
        const chat = global.db.data.chats[m.chat]
        
        // Solo responde si el modo está ON y no es un comando
        if (!chat.alastorIA || m.isBaileys || m.fromMe || !m.text) return false
        if (m.text.startsWith('.') || m.text.startsWith('#') || m.text.startsWith('/')) return false

        try {
            // Aquí el bot usa su propia lógica de IA interna (Gemini)
            // Le pasamos las instrucciones de personalidad antes del mensaje del usuario
            const promptAlastor = `Actúa como Alastor de Hazbin Hotel. Eres el Radio Demon. Tu lenguaje es refinado, de los años 30, carismático y sádico. Trata a Emmax como tu productor ejecutivo. A los demás como pecadores. Puedes usar groserías leves si te provocan. Responde de forma breve y entretenida. Usuario dice: ${m.text}`

            // Llamamos a la función interna de IA del bot
            // Nota: El nombre de la función puede variar según tu base (ej: conn.replyIA o client.chatAI)
            const response = await conn.getChatAI(promptAlastor) 

            let finalReply = `📻 *RADIO ALASTOR:* 🎙️\n\n`
            finalReply += `${response}\n\n`
            finalReply += `> _¡Sigan sintonizados!_ ♪`

            await client.sendMessage(m.chat, { text: finalReply }, { quoted: m })
            return true

        } catch (e) {
            console.error('Error en la frecuencia de Alastor:', e)
            return false
        }
    }
}
