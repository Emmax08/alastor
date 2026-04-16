export default {
    command: ['letra', 'font', 'fonts'],
    category: 'utils',
    run: async (client, m, { text, args, usedPrefix, command }) => {
        // Extracción de texto ultra-simple para evitar fallos
        let msgText = text || args.join(' ') || '';
        
        if (!msgText || msgText.trim() === '') {
            return m.reply(`🎙️ *Sintonía vacía...*\n\nUsa: *${usedPrefix + command} hola*`);
        }

        // Diccionario de estilos (Solo los más compatibles con iPhone)
        const styles = {
            mono: (t) => t.replace(/[a-z]/gi, v => "𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣"["mnopqrstuvwxyz".indexOf(v.toLowerCase())] || v),
            bold: (t) => t.replace(/[a-z]/gi, v => "𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳"["abcdefghijklmnopqrstuvwxyz".indexOf(v.toLowerCase())] || v),
            gothic: (t) => t.replace(/[a-z]/gi, v => "𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷"["abcdefghijklmnopqrstuvwxyz".indexOf(v.toLowerCase())] || v),
            script: (t) => t.replace(/[a-z]/gi, v => "𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏"["abcdefghijklmnopqrstuvwxyz".indexOf(v.toLowerCase())] || v)
        };

        // Construimos el mensaje de texto puro (Sin botones ni anuncios pesados)
        let response = `📻 *RADIO ALASTOR: FRECUENCIAS* 🎙️\n\n`;
        response += `*1. Mono:* \n\`\`\`${styles.mono(msgText)}\`\`\`\n\n`;
        response += `*2. Bold:* \n${styles.bold(msgText)}\n\n`;
        response += `*3. Gothic:* \n${styles.gothic(msgText)}\n\n`;
        response += `*4. Script:* \n${styles.script(msgText)}\n\n`;
        response += `> ✎ *Copia el que prefieras, pecador.* ♪`;

        // Enviamos como mensaje normal para que iPhone no lo bloquee
        await m.reply(response);
    }
};
