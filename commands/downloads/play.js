import yts from 'yt-search'
// Nota: Ya no necesitamos node-fetch para las APIs de descarga, 
// el nodo Lavalink se encarga de todo el procesamiento.

export default {
  command: ['play', 'mp3', 'ytmp3', 'ytaudio', 'playaudio'],
  category: 'downloader',
  run: async (client, m, args, usedPrefix, command) => { 
    try {
      const text = args ? args.join(' ') : ''
      if (!text) return m.reply('🎙️ *¡Sintonizando frecuencias!* Pero necesito el nombre o la URL para empezar la función. ♪')

      // 1. Identificar el nodo de Lavalink (suponiendo que client.lavalink está configurado)
      const player = client.lavalink.players.get(m.chat) || client.lavalink.create({
        guild: m.chat,
        voiceChannel: m.member.voice.channel.id, // Para bots de voz
        textChannel: m.chat,
        selfDeafen: true,
      })

      // 2. Búsqueda ultra-rápida vía Lavalink (usa internal APIs)
      const res = await player.search(text, m.author)
      
      if (res.loadType === 'LOAD_FAILED') throw new Error(res.exception.message)
      if (res.loadType === 'NO_MATCHES') return m.reply('🍎 No encontré esa melodía, querido.')

      const track = res.tracks[0]
      
      // 3. Información visual (Sin esperas externas)
      const infoMessage = `📻 🎙️  *𝗧𝗥𝗔𝗡𝗦𝗠𝗜𝗦𝗜𝗢𝗡 𝗠𝗨𝗦𝗜𝗖𝗔𝗟* 🎙️ 📻\n\n` +
        `📻 ➔ *Melodía* › ${track.title}\n` +
        `🎩 ➔ *Productor* › *${track.author}*\n` +
        `⏳ ➔ *Duración* › *${formatTime(track.duration)}*\n` +
        `🔗 ➔ *Frecuencia* › *${track.uri}*\n\n` +
        `*¡La música empezará a sonar ahora mismo!*`

      await client.sendMessage(m.chat, { 
        image: { url: track.displayThumbnail('maxresdefault') }, 
        caption: infoMessage 
      }, { quoted: m })

      // 4. Ejecución instantánea
      player.queue.add(track)
      if (!player.playing && !player.paused && !player.queue.size) player.play()

    } catch (e) {
      console.error(e)
      await m.reply(`📻 *¡CRASH!* La estática se apodera de la señal...\n> [Error: *${e.message}*]`)
    }
  }
}

function formatTime(ms) {
  const s = Math.floor(ms / 1000 % 60).toString().padStart(2, '0')
  const m = Math.floor(ms / 60000 % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}
