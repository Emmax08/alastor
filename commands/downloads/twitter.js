import fetch from 'node-fetch'

export default {
  command: ['twitter', 'x', 'xdl'],
  category: 'downloader',
  run: async (client, m, args, usedPrefix, command) => {
    // Verificamos que haya un argumento
    if (!args || !args[0]) {
      return m.reply('🎙️ *¡Atención a la frecuencia!* Por favor, ingrese un enlace de Twitter/X para iniciar la descarga. ♪')
    }

    // Validación básica de URL
    if (!args[0].match(/(twitter|x)\.com\/\w+\/status\//)) {
      return m.reply('🍎 *¡Qué descuido!* El enlace no parece ser una transmisión válida de Twitter/X. ¡Asegúrate de que sea correcto!')
    }

    try {
      const data = await getTwitterMedia(args[0])
      
      if (!data || !data.url) {
        return m.reply('📻 *¡Interferencia detectada!* Mis sombras no han podido capturar el contenido de ese enlace.')
      }

      const caption = `📻 🎙️  *𝗧𝗥𝗔𝗡𝗦𝗠𝗜𝗦𝗜𝗢𝗡 𝗗𝗘 𝗫* 🎙️ 📻\n\n` +
        `${data.title ? `📜 ➔ *Crónica* › ${data.title}\n` : ''}` +
        `${data.author ? `🎩 ➔ *Autor* › ${data.author}\n` : ''}` +
        `${data.date ? `📅 ➔ *Emisión* › ${data.date}\n` : ''}` +
        `${data.duration ? `⏳ ➔ *Duración* › ${data.duration}\n` : ''}` +
        `${data.resolution ? `📺 ➔ *Calidad* › ${data.resolution}\n` : ''}` +
        `${data.views ? `👁️ ➔ *Audiencia* › ${data.views}\n` : ''}` +
        `${data.likes ? `❤️ ➔ *Aplausos* › ${data.likes}\n` : ''}` +
        `🔗 ➔ *Frecuencia* › ${args[0]}\n\n` +
        `*¡El espectáculo debe continuar!*`

      if (data.type === 'video' || data.type === 'gif') {
        await client.sendMessage(m.chat, { 
          video: { url: data.url }, 
          caption, 
          mimetype: 'video/mp4', 
          fileName: 'twitter.mp4' 
        }, { quoted: m })
      } else if (data.type === 'image' || data.type === 'photo') {
        await client.sendMessage(m.chat, { 
          image: { url: data.url }, 
          caption 
        }, { quoted: m })
      } else {
        throw new Error('Formato de contenido no compatible.')
      }

    } catch (e) {
      console.error(e)
      const cmd = command || 'twitter'
      const pref = usedPrefix || '/'
      await m.reply(`📻 *¡CRASH!* La estática se apodera de la señal... \n> [Error en *${pref + cmd}*: ${e.message}]`)
    }
  }
}

async function getTwitterMedia(url) {
  const apis = [
    { 
      endpoint: `${global.APIs.stellar.url}/dl/twitter?url=${encodeURIComponent(url)}&key=${global.APIs.stellar.key}`, 
      extractor: res => {
        if (!res.status || !res.data?.result?.length) return null
        const media = res.data.result[0]
        return { 
          type: res.data.type || 'video', 
          title: res.data.title || null, 
          duration: res.data.duration || null, 
          resolution: media.quality || null, 
          url: media.url, 
          thumbnail: res.data.thumbnail || null 
        }
      }
    },
    { 
      endpoint: `${global.APIs.delirius.url}/download/twitterv2?url=${encodeURIComponent(url)}`, 
      extractor: res => {
        if (!res.status || !res.data?.media?.length) return null
        const media = res.data.media[0]
        const video = media.videos?.sort((a, b) => b.bitrate - a.bitrate)[0] // Mejor calidad
        return { 
          type: media.type, 
          title: res.data.description || null, 
          author: res.data.author?.username || null, 
          date: res.data.createdAt || null, 
          duration: media.duration || null, 
          resolution: video?.quality || null, 
          url: video?.url || media.url, 
          views: res.data.view || null, 
          likes: res.data.favorite || null 
        }
      }
    },
    { 
      endpoint: `${global.APIs.nekolabs.url}/downloader/twitter?url=${encodeURIComponent(url)}`, 
      extractor: res => {
        if (!res.success || !res.result?.media?.length) return null
        const media = res.result.media[0]
        const variant = media.variants?.at(-1)
        return { 
          type: media.type, 
          title: res.result.title || null, 
          url: variant?.url || media.url 
        }
      }
    }
  ]

  for (const { endpoint, extractor } of apis) {
    try {
      const res = await fetch(endpoint).then(r => r.json())
      const result = extractor(res)
      if (result && result.url) return result
    } catch (e) {
      // Intentar con la siguiente API
    }
    await new Promise(r => setTimeout(r, 600))
  }
  return null
}
