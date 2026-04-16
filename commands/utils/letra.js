import { selectedButton } from '../lib/message.js' // Ajusta según tu base

export default {
    command: ['letra', 'font', 'fonts'],
    category: 'tools',
    run: async (client, m, { text, usedPrefix, command }) => {
        if (!text) return m.reply(`🎙️ *Sintonía incorrecta...*\n\nUsa: *${usedPrefix + command} Tu texto aquí*`)

        // Diccionario de estilos (Unicode)
        const stylize = (t, styles) => {
            const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
            const map = {
                mono: "𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿",
                gothic: "𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷𝔄𝔅ℭmathfrak{D}𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ",
                bold: "𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏Ｑ𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗",
                script: "𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏𝒜𝐵𝒞𝒟𝐸𝐹𝒢𝐻𝐼𝒥𝒦𝐿𝑀𝒩𝒪𝒫𝒬𝑅𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵",
                circles: "ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ"
            }
            return t.split('').map(char => {
                const index = letters.indexOf(char)
                return index !== -1 ? map[styles][index] || char : char
            }).join('')
        }

        let menu = `📻 *RADIO ALASTOR: ESTILOS DE FUENTE* 🎙️\n`
        menu += `_Texto a transformar: ${text}_\n\n`
        menu += `1. 𝙼𝚘𝚗𝚘: ${stylize(text, 'mono')}\n`
        menu += `2. 𝔊𝔬𝔱𝔥𝔦𝔠: ${stylize(text, 'gothic')}\n`
        menu += `3. 𝐁𝐨𝐥𝐝: ${stylize(text, 'bold')}\n`
        menu += `4. 𝒮𝒸𝓇𝒾𝓅𝓉: ${stylize(text, 'script')}\n`
        menu += `5. Ⓒⓘⓡⓒⓛⓔⓢ: ${stylize(text, 'circles')}\n\n`
        menu += `> ✎ *Copia el estilo que más te guste, querido pecador.* ♪`

        await client.sendMessage(m.chat, { 
            text: menu,
            contextInfo: {
                externalAdReply: {
                    title: 'A L A S T O R - F O N T S',
                    body: 'Selecciona tu estilo favorito',
                    thumbnailUrl: 'https://i.imgur.com/u8M6X1h.png', // Una imagen de Alastor
                    sourceUrl: 'https://github.com/Emmax08',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m })
    }
}
