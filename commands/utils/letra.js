export default {
    command: ['letra', 'font', 'fonts'],
    category: 'utils',
    run: async (client, m, { text, args, usedPrefix, command }) => {
        // --- [ EXTRACCIÓN DE TEXTO BLINDADA ] ---
        // Intentamos obtener el texto de todas las fuentes posibles del handler
        let msgText = text || (args && args.length > 0 ? args.join(' ') : '') || (m.text ? m.text.split(' ').slice(1).join(' ') : '');
        let prefix = usedPrefix || '/';
        let cmd = command || 'letra';

        if (!msgText || msgText.trim() === '') {
            return m.reply(`🎙️ *¡Sintonía vacía, pecador!* ♪\n\nUsa: *${prefix + cmd} hola*`);
        }

        // --- [ GENERADOR DE ESTILOS ] ---
        const stylize = (t) => {
            const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const styles = {
                mono: "𝖺𝖻𝖼𝖽𝖾𝗀𝗁𝗂𝗃𝗄𝗅𝗆𝗇𝗈𝗉𝗊𝗋𝗌𝗍𝗎𝗏𝗐𝗑𝗒𝗓𝖠𝖡𝖢𝖣𝖤𝖥𝖦𝖧𝖨𝖩𝖪𝖫𝖬𝖭𝖮𝖯𝖰𝖱𝖲𝖳𝖴𝖵𝖶𝖷𝖸𝖹",
                gothic: "𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ",
                bold: "𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏Ｑ𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙",
                circles: "ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ"
            };
            
            const res = {};
            for (let s in styles) {
                res[s] = t.split('').map(char => {
                    const i = letters.indexOf(char);
                    return i !== -1 ? styles[s][i] : char;
                }).join('');
            }
            return res;
        };

        const s = stylize(msgText);
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
                    body: 'Cambiando la frecuencia del texto...',
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
