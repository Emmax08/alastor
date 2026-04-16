export default {
    command: ['letra', 'font', 'fonts'],
    category: 'utils',
    run: async (client, m) => {
        // 1. Obtenemos el texto eliminando el comando de forma segura
        const text = m.text ? m.text.replace(/^\/[a-zA-Z]+\s+/, '').trim() : '';

        if (!text || text === m.text) {
            return m.reply(`🎙️ *Sintonía vacía...*\n\nUsa: */letra hola*`);
        }

        // 2. Mapeo de estilos (Corregido para máxima compatibilidad)
        const styles = {
            mono: (t) => t.replace(/[a-zA-Z]/g, v => "𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣"["mnopqrstuvwxyz".indexOf(v.toLowerCase())] || v),
            bold: (t) => t.replace(/[a-zA-Z]/g, v => "𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳"["abcdefghijklmnopqrstuvwxyz".indexOf(v.toLowerCase())] || v),
            gothic: (t) => t.replace(/[a-zA-Z]/g, v => "𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷"["abcdefghijklmnopqrstuvwxyz".indexOf(v.toLowerCase())] || v),
            script: (t) => t.replace(/[a-zA-Z]/g, v => "𝒶𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏"["ajklmnopqrstuvwxyz".indexOf(v.toLowerCase())] || v)
        };

        // 3. Construcción del mensaje con formato nativo de WhatsApp
        let response = `📻 *RADIO ALASTOR: FRECUENCIAS* 🎙️\n\n`;
        response += `*1. Máquina:* \n\`\`\`${styles.mono(text)}\`\`\`\n\n`;
        response += `*2. Negrita:* \n${styles.bold(text)}\n\n`;
        response += `*3. Gótico:* \n${styles.gothic(text)}\n\n`;
        response += `*4. Elegante:* \n${styles.script(text)}\n\n`;
        response += `> ✎ *Copia el estilo que prefieras.* ♪`;

        await m.reply(response);
    }
};
