export default {
    command: ['letra', 'font', 'fonts'],
    category: 'utils', // Asegúrate de que coincida con el nombre de la carpeta
    run: async (client, m, { text, usedPrefix, command }) => {
        if (!text) return m.reply(`🎙️ *¡Sintonía vacía, pecador!* ♪\n\nUsa: *${usedPrefix + command} hola*`);

        // Generador de estilos (Unicode)
        const stylize = (t) => {
            return {
                mono: t.replace(/[a-zA-Z]/g, v => "𝖺𝖻𝖼𝖽𝖾𝖿𝗀𝗁𝗂𝗃𝗄𝗅𝗆𝗇𝗈𝗉𝗊𝗋𝗌𝗍𝗎𝗏𝗐𝗑𝗒𝗓𝖠𝖡𝖢𝖣𝖤𝖥𝖦𝖧𝖨𝖩𝖪𝖫𝖬𝖭𝖮𝖯𝖰𝖱𝖲𝖳𝖴𝖵𝖶𝖷𝖸𝖹"["abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(v)] || v),
                gothic: t.replace(/[a-zA-Z]/g, v => "𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷𝔄𝔅ℭmathfrak{D}𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ"["abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(v)] || v),
                bold: t.replace(/[a-zA-Z]/g, v => "𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏Ｑ𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙"["abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(v)] || v),
                circles: t.replace(/[a-zA-Z]/g, v => "ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ"["abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(v)] || v)
            };
        };

        const s = stylize(text);
        let menu = `📻 *RADIO ALASTOR: ESTILOS* 🎙️\n\n`;
        menu += `*1.* 𝙼𝚘𝚗𝚘 › ${s.mono}\n`;
        menu += `*2.* 𝔊𝔬𝔱𝔥𝔦𝔠 › ${s.gothic}\n`;
        menu += `*3.* 𝐁𝐨𝐥𝐝 › ${s.bold}\n`;
        menu += `*4.* Ⓒⓘⓡⓒⓛⓔⓢ › ${s.circles}\n\n`;
        menu += `> ✎ *Copia el estilo que prefieras.* ♪`;

        await client.sendMessage(m.chat, {
            text: menu,
            contextInfo: {
                externalAdReply: {
                    title: '【 📻 Ｆｏｎｔｓ  Ａｌａｓｔｏｒ 】',
                    body: 'Cambiando la frecuencia de tu texto...',
                    thumbnailUrl: 'https://i.imgur.com/u8M6X1h.png',
                    sourceUrl: 'https://github.com/Emmax08',
                    mediaType: 1,
                    showAdAttribution: true,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });
    }
};
