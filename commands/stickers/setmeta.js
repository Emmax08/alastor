export default {
  command: ['setstickermeta', 'setmeta'],
  category: 'stickers',
  run: async (client, m, args, usedPrefix, command) => {
    // Emojis y estilo de Alastor
    const radio = '🎙️'
    const sonrisa = '📻'
    const cetro = '🪄'

    if (!args || args.length === 0) {
      return m.reply(`${radio} ¡Sintonía interrumpida! Por favor, ingresa el nombre del pack y el autor para tus estampas.\n\n> *Ejemplo:* ${usedPrefix + command} Hotel Hazbin • Alastor`)
    }

    try {
      const fullArgs = args.join(' ')
      // Soporta separadores como |, • o /
      const separatorIndex = fullArgs.search(/[|•\/]/)
      let metadatos01, metadatos02

      if (separatorIndex === -1) {
        metadatos01 = fullArgs.trim()
        metadatos02 = ''
      } else {
        metadatos01 = fullArgs.slice(0, separatorIndex).trim()
        metadatos02 = fullArgs.slice(separatorIndex + 1).trim()
      }

      if (!metadatos01) {
        return m.reply(`${sonrisa} ¡Qué descuidado! El nombre del pack no puede quedar en el olvido. Inténtalo de nuevo.`)
      }

      const db = global.db.data
      if (!db.users[m.sender]) db.users[m.sender] = {}

      // Guardamos en las variables que usa tu sistema de plugins
      db.users[m.sender].metadatos = metadatos01
      db.users[m.sender].metadatos2 = metadatos02

      await client.sendMessage(m.chat, { 
        text: `${cetro} ¡Espectacular! He sintonizado tu nueva identidad para los stickers. ¡Que comience el show, querido amigo!` 
      }, { quoted: m })

    } catch (e) {
      await m.reply(`> Un error inesperado ha estropeado la transmisión *${usedPrefix + command}*.\n> [Error: *${e.message}*]`)
    }
  }
}
