export default {
  command: ['setstickermeta', 'setmeta'],
  category: 'stickers',
  run: async (client, m, args, usedPrefix, command) => {
    // Emojis de Alastor
    const radio = '🎙️'
    const sonrisa = '📻'

    // Si el usuario no pone nada, le explicamos cómo hacerlo
    if (!args || args.length === 0) {
      return m.reply(`${radio} ¡Sintonía errónea! Debes decirme qué nombre de pack y autor deseas.\n\n> *Ejemplo:* ${usedPrefix + command} Pack de Emmax • Alastor`)
    }

    try {
      const fullArgs = args.join(' ')
      // Buscamos los separadores comunes: | o • o /
      const separatorIndex = fullArgs.search(/[|•\/]/)
      
      let metadatos01, metadatos02

      if (separatorIndex === -1) {
        // Si no hay separador, todo el texto es el Pack y el Autor queda vacío
        metadatos01 = fullArgs.trim()
        metadatos02 = ' ' // Espacio en blanco para que no use el del bot
      } else {
        // Dividimos el texto exactamente por el separador
        metadatos01 = fullArgs.slice(0, separatorIndex).trim()
        metadatos02 = fullArgs.slice(separatorIndex + 1).trim()
      }

      const db = global.db.data
      if (!db.users[m.sender]) db.users[m.sender] = {}

      // ESTO ES LO IMPORTANTE:
      // Guardamos exactamente lo que tú escribiste. 
      // Si metadatos02 está vacío, le ponemos un espacio para "engañar" al bot 
      // y que no rellene con su texto automático.
      db.users[m.sender].metadatos = metadatos01
      db.users[m.sender].metadatos2 = metadatos02 || ' ' 

      await client.sendMessage(m.chat, { 
        text: `${sonrisa} ¡Trato hecho! He sintonizado tus nuevos metadatos. Ahora tus stickers llevarán tu marca personal y nada más.` 
      }, { quoted: m })

    } catch (e) {
      await m.reply(`> Hubo un fallo en la transmisión: ${e.message}`)
    }
  }
}
