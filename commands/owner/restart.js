import fs from 'fs'

export default {
  command: ['restart', 'reiniciar'],
  category: 'mod',
  isOwner: true,
  run: async (client, m) => {
    // El mensaje que solicitaste con el toque del Radio Demon
    await client.reply(m.chat, `Reiniciando la radio...\n> *oh qué delicia, parece qué el espectáculo está por comenzar...*`, m)
    
    // Guardamos el chat para avisar cuando vuelva a encender
    const data = { chat: m.chat, key: m.key }
    fs.writeFileSync('./reboot.json', JSON.stringify(data))

    setTimeout(() => {
      if (process.send) {
        process.send("restart")
      } else {
        process.exit(0)
      }
    }, 3000)
  },
};
