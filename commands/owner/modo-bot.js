export default {
    command: ['globalbot'], // Ahora el comando es exactamente /globalbot
    category: 'owner',
    run: async (client, m, { args, usedPrefix, command }) => {
        const botJid = client.user.id.split(':')[0] + '@s.whatsapp.net'
        const sender = m.sender // Definimos sender para evitar errores
        
        // 1. Aseguramos que la base de datos esté lista
        if (!global.db.data.settings) global.db.data.settings = {}
        if (!global.db.data.settings[botJid]) global.db.data.settings[botJid] = {}
        
        const settings = global.db.data.settings[botJid]
        
        // 2. Verificación de seguridad (Solo tú, Emmax)
        const isOwners = [botJid, ...global.owner.map(num => num + '@s.whatsapp.net')].includes(sender);
        if (!isOwners) return m.reply('📻 *¡Solo mi creador tiene acceso a este interruptor!* ♪')

        // 3. Capturamos la acción (on u off)
        const action = args[0] ? args[0].toLowerCase() : null

        if (action === 'off') {
            if (settings.globalDisabled) return m.reply('🎙️ La señal ya está cortada globalmente.')
            settings.globalDisabled = true
            await m.reply('🚫 *APAGADO GLOBAL ACTIVADO* 🚫\n\n> El bot ha dejado de transmitir para todos los usuarios. Solo los administradores del sistema pueden usar comandos.')
        } 
        
        else if (action === 'on') {
            if (!settings.globalDisabled) return m.reply('🎙️ La señal ya está al aire.')
            settings.globalDisabled = false
            await m.reply('✅ *BOT ACTIVO GLOBALMENTE* ✅\n\n> La transmisión se ha restaurado. Todos los usuarios pueden usar el bot nuevamente. ♪')
        } 
        
        else {
            // Mensaje de ayuda si no ponen on/off
            m.reply(`🎙️ *ESTADO GLOBAL:* ${settings.globalDisabled ? '🔴 APAGADO' : '🟢 ACTIVO'}\n\nUsa:\n➔ *${usedPrefix + command} on*\n➔ *${usedPrefix + command} off*`)
        }
    }
}
