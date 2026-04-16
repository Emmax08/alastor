// ... dentro de tu comando bot ...
run: async (client, m, args, usedPrefix, command) => {
    const botJid = client.user.id.split(':')[0] + '@s.whatsapp.net'
    
    // 1. Aseguramos que settings exista para evitar el "undefined"
    if (!global.db.data.settings) global.db.data.settings = {}
    if (!global.db.data.settings[botJid]) global.db.data.settings[botJid] = {}
    
    const settings = global.db.data.settings[botJid]
    const isOwners = [botJid, ...global.owner.map(num => num + '@s.whatsapp.net')].includes(sender);

    // 2. Verificamos que args sea un array y tenga contenido antes de leer [0]
    const action = (args && args[0]) ? args[0].toLowerCase() : null

    if (action === 'off') {
        settings.globalDisabled = true
        await m.reply('🚫 *APAGADO GLOBAL:* El bot ahora ignorará a todos.')
    } else if (action === 'on') {
        settings.globalDisabled = false
        await m.reply('✅ *BOT ACTIVO:* Transmisión restaurada.')
    } else {
        m.reply(`🎙️ Estado: *${settings.globalDisabled ? 'OFF' : 'ON'}*\nUsa: ${usedPrefix + command} on/off`)
    }
}
