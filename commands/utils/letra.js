import { foneStyles } from './lib/fonts.js' // Asumiendo que tienes una librería de fuentes

export default {
    command: ['letra', 'font', 'fonts'],
    category: 'tools',
    run: async (client, m, { text, usedPrefix, command }) => {
        if (!text) return m.reply(`🎙️ *¿Qué texto quieres transformar?*\n\nUsa: *${usedPrefix + command} Hola Mundo*`)

        // Definimos los estilos de letra (puedes agregar más aquí)
        const styles = {
            "𝖲𝖺𝗇𝗌": (t) => t.replace(/[a-z]/gi, v => "𝖺𝖻𝖼𝖽𝖾𝖿𝗀𝗁𝗂𝗃𝗄𝗅𝗆𝗇𝗈𝗉𝗊𝗋𝗌𝗍𝗎𝗏𝗐𝗑𝗒𝗓"["abcdefghijklmnopqrstuvwxyz".indexOf(v.toLowerCase())] || v),
            "𝑩𝒐𝒍𝒅": (t) => t.replace(/[a-z]/gi, v => "𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛"["abcdefghijklmnopqrstuvwxyz".indexOf(v.toLowerCase())] || v),
            "𝙼𝚘𝚗𝚘": (t) => t.replace(/[a-z]/gi, v => "𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣"["mnopqrstuvwxyz".indexOf(v.toLowerCase())] || v),
            "𝔊𝔬𝔱𝔥𝔦𝔠": (t) => t.replace(/[a-z]/gi, v => "𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷"["abcdefghijklmnopqrstuvwxyz".indexOf(v.toLowerCase())] || v),
            "𝒮𝒸𝓇𝒾𝓅𝓉": (t) => t.replace(/[a-z]/gi, v => "𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏"["abcdefghijklmnopqrstuvwxyz".indexOf(v.toLowerCase())] || v)
        }

        let menu = `🎙️ *SELECTOR DE FUENTES* 🎙️\n\n`
        menu += `Texto original: _${text}_\n\n`
        
        let count = 1
        let results = []
        
        for (let [name, transform] of Object.entries(styles)) {
            let transformedText = transform(text)
            menu += `*${count}.* ${transformedText}\n`
            results.push(transformedText)
            count++
        }

        menu += `\n> ✎ *Responde a este mensaje con el número de la fuente que quieras copiar.*`

        // Enviamos el menú
        const sentMsg = await client.sendMessage(m.chat, { text: menu }, { quoted: m })

        // Lógica para capturar la respuesta (WaitForKey)
        // Esto depende de si tu base tiene un sistema de "esperar respuesta"
        // Si no, el usuario simplemente verá la lista y podrá copiarla manualmente.
    }
}
