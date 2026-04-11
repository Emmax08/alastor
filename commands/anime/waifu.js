import fetch from 'node-fetch'

export default {
  command: ['waifu', 'neko'],
  category: 'anime',
  run: async (client, m, args, usedPrefix, command, text) => {
    try {
      await m.react('🕒')
      let mode = db.data.chats[m.chat]?.nsfw ? 'nsfw' : 'sfw'
      let res = await fetch(`https://api.waifu.pics/${mode}/${command}`)
      if (!res.ok) return
      let json = await res.json()
      if (!json.url) return
      let img = Buffer.from(await (await fetch(json.url)).arrayBuffer())
      
      // El mensaje con tu nueva temática
      const caption = `> Oh, aquí tienes una fantasía encantadora para ti... Tan segura y tan deliciosamente vacía...`
      
      await client.sendFile(m.chat, img, 'thumbnail.jpg', caption, m)
      await m.react('✔️')
    } catch (e) {
      await m.react('✖️')
      await m.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`)
    }
  },
}
