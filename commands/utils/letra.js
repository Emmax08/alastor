export default {
    command: ['letra', 'font', 'fonts'],
    category: 'utils',
    run: async (client, m) => {
        // --- [ EXTRACCIÓN MANUAL DE TEXTO ] ---
        // Obtenemos el texto completo del mensaje
        let fullText = m.body || m.text || '';
        
        // Cortamos el comando para quedarnos solo con el texto (ej: /letra hola -> hola)
        let msgText = fullText.split(' ').slice(1).join(' ');

        if (!msgText || msgText.trim() === '') {
            return m.reply(`🎙️ *¡Sintonía vacía, pecador!* ♪\n\nUsa: */letra hola*`);
        }

        // --- [ ESTILOS COMPATIBLES ] ---
        const stylize = (t) => {
            const abc = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const styles = {
                mono: "𝖺𝖻𝖼𝖽𝖾𝗀𝗁𝗂𝗃𝗄𝗅𝗆𝗇𝗈𝗉𝗊𝗋𝗌𝗍𝗎𝗏𝗐𝗑𝗒𝗓𝖠𝖡𝖢𝖣𝖤𝖥𝖦𝖧𝖨𝖩𝖪𝖫𝖬𝖭𝖮𝖯𝖰𝖱𝖲𝖳𝖴𝖵𝖶𝖷𝖸𝖹",
                bold: "𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏Ｑ𝐑𝐒Ｔ𝐔𝐕𝐖𝐗𝐘Ｚ",
                gothic: "𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ",
                script: "𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏𝒜𝐵𝒞𝒟𝐸𝐹𝒢𝐻𝐼𝒥𝒦𝐿𝑀𝒩𝒪𝒫𝒬𝑅𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵"
            };
            
            const res = {};
            for (let s in styles) {
                res[s] = t.split('').map(char => {
                    const i = abc.indexOf(char);
                    return i !== -1 ? styles[s][i] : char;
                }).join('');
            }
            return res;
        };

        const s = stylize(msgText);

        // --- [ MENSAJE FINAL ] ---
        let response = `📻 *RADIO ALASTOR: FRECUENCIAS* 🎙️\n\n`;
        response += `*1. Mono:* \n\`\`\`${s.mono}\`\`\`\n\n`;
        response += `*2. Bold:* \n${s.bold}\n\n`;
        response += `*3. Gothic:* \n${s.gothic}\n\n`;
        response += `*4. Script:* \n${s.script}\n\n`;
        response += `> ✎ *Copia el estilo que prefieras.* ♪`;

        await m.reply(response);
    }
};
