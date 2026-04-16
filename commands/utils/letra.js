export default {
    command: ['letra', 'font'],
    category: 'utils',
    run: async (client, m, { text }) => {
        // Extraemos el texto de forma segura
        const input = text || m.text?.split(' ').slice(1).join(' ') || '';

        if (!input) return m.reply(`🎙️ *¡Sintonía vacía!* ♪\n\nUsa: */letra hola*`);

        // Función de transformación directa (Evita los rombos )
        const transform = (str, offset) => {
            return str.split('').map(char => {
                const code = char.charCodeAt(0);
                // Solo transforma letras A-Z y a-z
                if (code >= 65 && code <= 90) return String.fromCodePoint(code + offset - 65);
                if (code >= 97 && code <= 122) return String.fromCodePoint(code + offset - 71);
                return char;
            }).join('');
        };

        // Generamos los estilos usando offsets de la tabla Unicode
        const f = {
            mono: transform(input, 0x1D670),
            bold: transform(input, 0x1D400),
            gothic: transform(input, 0x1D504),
            script: transform(input, 0x1D4D0)
        };

        let menu = `📻 *RADIO ALASTOR: FRECUENCIAS* 🎙️\n\n`;
        menu += `*1. Máquina:* \n\`\`\`${f.mono}\`\`\`\n\n`;
        menu += `*2. Negrita:* \n${f.bold}\n\n`;
        menu += `*3. Gótico:* \n${f.gothic}\n\n`;
        menu += `*4. Elegante:* \n${f.script}\n\n`;
        menu += `> ✎ *Copia el estilo que prefieras, pecador.* ♪`;

        await m.reply(menu);
    }
};
