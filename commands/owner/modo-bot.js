export default {
    command: ['bot', 'self'],
    category: 'owner',
    run: async (client, m, { args, usedPrefix, command }) => {
        // Usamos la variable isOwners que ya tienes definida en tu handler
        const botJid = client.user.id.split(':')[0] + '@s.whatsapp.net'
        const settings = global.db.data.settings[botJid]
        
        // Verificación de Dueño (Owner)
        const isOwners = [botJid, ...global.owner.map(num => num + '@s.whatsapp.net')].includes(m.sender);
        if (!isOwners) return m.reply('📻 *¡Solo mi creador puede sintonizar esta frecuencia!* ♪')

        if (args[0] === 'off') {
            if (settings.self) return m.reply('📻 El bot ya está en modo *Privado*.')
            settings.self = true
            await m.reply('🔴 *Transmisión Cortada.* El bot ahora es privado. ♪')
        } 
        else if (args[0] === 'on') {
            if (!settings.self) return m.reply('📻 El bot ya está transmitiendo para todos.')
            settings.self = false
            await m.reply('🟢 *¡Estamos al aire!* El bot vuelve a ser público. ♪')
        } 
        else {
            m.reply(`🎙️ *Configuración actual:* ${settings.self ? 'Privado' : 'Público'}\n\nUsa:\n➔ *${usedPrefix + command} on*\n➔ *${usedPrefix + command} off*`)
        }
    }
}
