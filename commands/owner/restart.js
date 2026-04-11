import fs from 'fs'

export default {
  command: ['restart', 'reiniciar'],
  category: 'mod',
  isOwner: true,
  run: async (client, m) => {
    await client.reply(m.chat, `✎ Reiniciando el infierno...\n> *Prepárate para el vacío...*`, m)
    
    // Guardamos dónde debe avisar al despertar
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
