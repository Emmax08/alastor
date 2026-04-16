export default {
    command: ['mantenimiento', 'globaloff', 'botstatus'], // Cambiamos el nombre para que no choque con tu otro comando
    category: 'owner',
    run: async (client, m, { args, usedPrefix, command }) => {
        const botJid = client.user.id.split(':')[0] + '@s.whatsapp.net'
        const settings = global.db.data.settings[botJid]

        const isOwners = [botJid, ...global.owner.map(num => num + '@s.whatsapp.net')].includes(m.sender);
        if (!isOwners) return m.reply('📻 Solo el dueño puede usar esto.')

        // Usamos 'globalOff' para que NO choque con tu comando de privados (.self)
        if (args[0] === 'off') {
            settings.globalOff = true 
            await m.reply('🚫 *APAGADO GLOBAL ACTIVADO* 🚫\nEl bot ignorará a todos (excepto owners) en todos lados.')
        } else if (args[0] === 'on') {
            settings.globalOff = false
            await m.reply('✅ *BOT ACTIVO GLOBALMENTE* ✅')
        } else {
            m.reply(`🎙️ Estado Global: *${settings.globalOff ? 'APAGADO' : 'ENCENDIDO'}*\nUsa: ${usedPrefix + command} on/off`)
        }
    }
}
