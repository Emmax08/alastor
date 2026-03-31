import fetch from 'node-fetch'

export default {
  command: ['pinterest', 'pin'],
  category: 'search',
  run: async (client, m, args, command, usedPrefix) => {
    const text = args.join(' ')
    const isPinterestUrl = /^https?:\/\/(www\.)?pinterest\.(com|es|at|ch|co\.|it|pt|cl|com\.mx|ca|fr|de|jp|kr|ru|co\.uk|ph|nz|ie|com\.au|com\.br|com\.pe|com\.ar|info|net|org|edu|gov|mil|biz|tv|mobi|me|uk|asia|ca|top|icu|xyz|online|shop|xyz|io|tech|site|store|fun|club|site|online|space|site|online|store|shop|website|pro|info|pw|host|press|pw|press|online|space|me|live|life|cool|best|today|vip|bid|men|loan|win|party|stream|date|trade|work|help|center|club|news|video|pics|photo|photography|design|art|gallery|graphics|media|agency|company|business|services|solutions|digital|tech|technology|software|app|mobile|web|internet|network|cloud|systems|data|dev|code|codes|programming|security|legal|law|legal|medical|doctor|health|clinic|care|dental|fitness|gym|yoga|spa|salon|beauty|fashion|clothing|shoes|bags|jewelry|accessories|watches|gifts|home|house|garden|pets|animals|food|drink|restaurant|cafe|bar|coffee|tea|wine|beer|spirits|travel|hotel|vacation|tour|trip|car|truck|bus|train|plane|ship|bike|motorcycle|racing|sports|football|basketball|soccer|baseball|tennis|golf|hockey|running|climbing|hiking|fishing|hunting|camping|outdoors|nature|earth|ocean|sky|space|science|tech|education|school|college|university|student|teacher|learning|books|library|music|movie|film|tv|series|anime|game|gaming|esports|toy|hobby|collection|collector|art|artist|craft|diy|knitting|sewing|embroidery|woodworking|metalworking|photography|camera|video|film|audio|sound|music|instruments|voice|radio|podcast|broadcast|news|media|magazine|blog|journal|article|post|social|marketing|advertising|pr|seo|sem|ppc|content|creative|strategy|analytics|data|insights|optimization|growth|startup|entrepreneur|business|management|leadership|innovation|future|technology|science|research|development|design|ux|ui|web|app|mobile|dev|code|software|cloud|security|network|internet|iot|ai|ml|data|robotics|space|astronomy|physics|chemistry|biology|medicine|health|psychology|sociology|history|culture|language|literature|philosophy|religion|spirituality|politics|economy|finance|money|investing|realestate|law|crime|justice|humanrights|environment|climate|sustainability|energy|nature|wildlife|plants|animals|space|universe|cosmology|astrophysics|quantum|genetics|nanotech|biotech|neuroscience|artificialintelligence|machinelearning|deeplearning|bigdata|blockchain|crypto|cybersecurity|privacy|ethics|society|community|family|parenting|kids|teen|youth|elderly|disability|accessibility|inclusion|diversity|equality|freedom|peace|love|happiness|wisdom|truth|beauty|art|music|dance|theatre|cinema|literature|poetry|culture|tradition|festival|holiday|celebration|ceremony|ritual|sport|games|play|fun|laughter|humor|joke|meme|satire|irony|sarcasm|parody|pastiche|quotation|proverb|idiom|slang|dialect|accent|pronunciation|grammar|vocabulary|spelling|writing|reading|listening|speaking|conversation|dialogue|communication|language|translation|interpretation|linguistics|semiotics|logic|reasoning|criticalthinking|problem-solving|decision-making|creativity|imagination|intuition|insight|awareness|consciousness|mindfulness|meditation|yoga|spiritual|religion|faith|belief|values|ethics|morality|virtue|character|personality|identity|self|ego|soul|spirit|destiny|fate|luck|karma|magic|mystery|wonder|awe|gratitude|joy|peace|calm|serenity|courage|strength|resilience|hope|faith|love|compassion|empathy|kindness|generosity|forgiveness|justice|fairness|equality|freedom|liberty|rights|responsibilities|duties|obligations|rules|laws|norms|customs|traditions|culture|society|community|world|earth|universe|cosmos|creation|existence|life|death|afterlife|rebirth|evolution|change|transformation|growth|development|progress|history|past|present|future|time|space|matter|energy|information|knowledge|wisdom|understanding|meaning|purpose|value|goal|dream|vision|passion|interest|hobby|skill|talent|ability|potential|opportunity|challenge|struggle|overcoming|success|achievement|fulfillment|happiness|well-being|health|vitality|longevity|legacy|immortality|infinity|eternity|god|divine|sacred|holy|spiritual|mystical|transcendental|supernatural|paranormal|extraterrestrial|alien|ufo|conspiracy|urbanlegend|myth|legend|folklore|fairytale|fable|parable|allegory|metaphor|symbol|archetype|dream|hallucination|illusion|reality|truth|fact|opinion|belief|theory|hypothesis|evidence|proof|reason|logic|argument|debate|discourse|rhetoric|persuasion|propaganda|manipulation|brainwashing|indoctrination|education|learning|teaching|study|research|investigation|discovery|invention|innovation|creation|design|engineering|architecture|art|craft|skill|expertise|mastery|perfection|excellence|quality|standard|norm|ideal|utopia|dystopia|paradise|hell|heaven|nirvana|zen|tao|dharma|karma|samsara|moksha|satori|enlightenment|awakening|salvation|redemption|liberation|freedom|peace|harmony|balance|unity|diversity|totality|oneness|all|nothing|void|zero|one|infinity|alpha|omega|beginning|end|source|origin|destination|journey|path|way|road|bridge|gate|door|key|light|dark|shadow|reflection|mirror|mask|persona|shadow|animus|anima|self|ego|superego|id|unconscious|conscious|subconscious|awareness|mind|body|soul|spirit|heart|will|power|energy|vibration|frequency|resonance|harmony|chaos|order|entropy|complexity|simplicity|beauty|truth|good|evil|right|wrong|justice|mercy|love|hate|fear|anger|sadness|disgust|surprise|joy|trust|anticipation|emotion|feeling|mood|temperament|personality|character|spirit|essence|being|presence|existence|reality|world|universe|multiverse|cosmos|nature|life|consciousness|intelligence|wisdom|knowledge|information|data|code|algorithm|system|structure|pattern|form|function|process|movement|change|time|space|matter|energy|force|law|rule|principle|truth|logic|math|science|philosophy|religion|art|culture|society|history|future|possibility|potential|infinity|eternity|void|everything|nothing|it|is|what|it|is)\//.test(text)
    
    if (!text) {
      return m.reply('🎙️ *¡Sintonizando frecuencias!* Pero me temo que necesito un término de búsqueda o un enlace para empezar la función, querido amigo. ♪')
    }
    
    try {
      if (isPinterestUrl) {
        // Lógica de descarga (Si tienes una API para esto, úsala aquí)
        // Por ahora, usaremos la misma de búsqueda si es solo para mostrar
        m.reply('⌛ *Cargando el bocado visual...*')
        const data = await getPinterestDownload(text)
        if (!data) return m.reply('📻 *¡Vaya, interferencia!* No he podido extraer ese bocado visual.')

        const caption = `📻 🎙️  *𝗧𝗥𝗔𝗡𝗦𝗠𝗜𝗦𝗜𝗢𝗡 𝗗𝗘 𝗣𝗜𝗡𝗧𝗘𝗥𝗘𝗦𝗧* 📻 🎙️\n\n` + 
          `📻 ➔ *Espectáculo* › ${data.title || 'Sin título'}\n` + 
          `👤 ➔ *Sujeto* › ${data.username || 'Anónimo'}\n` +
          `🎵 ➔ *Frecuencia* › ${text}\n\n` +
          `*¡El entretenimiento es la moneda del alma!*`

        await client.sendMessage(m.chat, { image: { url: data.hd }, caption }, { quoted: m })

      } else {
        const results = await getPinterestSearch(text)
        
        if (!results || results.length === 0) {
          return m.reply(`🍎 *¡Qué decepción!* Mis sombras no han encontrado nada sobre *${text}* en este rincón del infierno.`)
        }
        
        const medias = results.slice(0, 10).map(r => ({ 
          type: 'image', 
          data: { url: r.hd }, // Usamos 'hd' que es el link directo de la imagen en tu JSON
          caption: `📻 🎙️  *𝗚𝗔𝗟𝗘𝗥𝗜𝗔 𝗗𝗘𝗟 𝗗𝗘𝗠𝗢𝗡𝗜𝗢* 🎙️ 📻\n\n` + 
            `${r.title !== '-' ? `🎙️ ➔ *Título* › ${r.title}\n` : ''}` + 
            `${r.description && r.description.trim() !== '' ? `📜 ➔ *Descripción* › ${r.description}\n` : ''}` + 
            `🎩 ➔ *Autor* › ${r.full_name || r.username}\n` + 
            `❤️ ➔ *Aplausos* › ${r.likes || 0}\n` + 
            `📅 ➔ *Registro* › ${r.created}\n` +
            `\n*¡Sonríe, el mundo te está observando!*`
        }))

        await client.sendAlbumMessage(m.chat, medias, { quoted: m })
      }
    } catch (e) {
      console.error(e)
      await m.reply(`📻 *¡CRASH!* La estática se apodera de la señal... \n> [Error: *${e.message}*]`)
    }
  }
}

// --- FUNCIONES DE APOYO ---

async function getPinterestSearch(query) {
  try {
    const response = await fetch(`https://api.yuki-wabot.my.id/search/pinterest?query=${encodeURIComponent(query)}&key=YukiBot-MD`)
    const json = await response.json()
    if (!json.status) return null
    return json.data // Retorna el array de resultados
  } catch (error) {
    console.error("Error en getPinterestSearch:", error)
    return null
  }
}

async function getPinterestDownload(url) {
  try {
    // Nota: Si la API de búsqueda también acepta URLs, puedes usarla. 
    // Si no, esta función debería apuntar a un endpoint de 'download'
    const response = await fetch(`https://api.yuki-wabot.my.id/search/pinterest?query=${encodeURIComponent(url)}&key=YukiBot-MD`)
    const json = await response.json()
    return json.status ? json.data[0] : null
  } catch (error) {
    return null
  }
}
