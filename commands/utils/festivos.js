export default {
    command: ['letra', 'font', 'diadel'],
    category: 'utils',
    run: async (client, m, { text }) => {
        // --- [ SISTEMA DE FECHAS IMPORTANTES ] ---
        const hoy = new Date();
        const dia = hoy.getDate();
        const mes = hoy.getMonth() + 1; // Enero es 0
        const fechaActual = `${dia}/${mes}`;

        const festividades = {
            "1/1": "¡Feliz Año Nuevo! 🎆 Que este ciclo venga cargado de buena música y pecado del bueno.",
            "14/2": "¡Feliz 14 de febrero! ❤️ San Valentín ha llegado. Espero que se la pasen de maravilla con sus parejas o amigos. ♪",
            "10/5": "¡Feliz Día de las Madres! 💐 Un saludo especial a las reinas del hogar desde la estación de Alastor.",
            "15/9": "¡Viva México! 🇲🇽 Preparen el tequila y el pozole, ¡que hoy se grita con fuerza!",
            "31/10": "¡Feliz Halloween! 🎃 Mi época favorita... que el miedo los acompañe en esta noche de brujas.",
            "1/11": "Día de Todos los Santos 💀 Recordando a los que ya no están en este plano.",
            "24/12": "¡Feliz Nochebuena! 🎄 Pórtense mal para que Santa no les traiga nada, ¡jajaja!",
            "25/12": "¡Feliz Navidad! 🎁 Espero que estén disfrutando en familia."
        };

        // Si hoy es una fecha importante, mandamos el saludo primero
        if (festividades[fechaActual]) {
            await m.reply(`📻 *ANUNCIO ESPECIAL DE ALASTOR* 🎙️\n\n${festividades[fechaActual]}`);
        }

        // --- [ LÓGICA ORIGINAL DE FUENTES ] ---
        const input = text || m.text?.split(' ').slice(1).join(' ') || '';
        if (!input) return; // Si no hay texto, solo mandó el saludo del día (si existe)

        const transform = (str, offset) => {
            return str.split('').map(char => {
                const code = char.charCodeAt(0);
                if (code >= 65 && code <= 90) return String.fromCodePoint(code + offset - 65);
                if (code >= 97 && code <= 122) return String.fromCodePoint(code + offset - 71);
                return char;
            }).join('');
        };

        const f = {
            mono: transform(input, 0x1D670),
            bold: transform(input, 0x1D400),
            gothic: transform(input, 0x1D504)
        };

        let menu = `📻 *RADIO ALASTOR: FRECUENCIAS* 🎙️\n\n`;
        menu += `*1. Máquina:* \n\`\`\`${f.mono}\`\`\`\n\n`;
        menu += `*2. Negrita:* \n${f.bold}\n\n`;
        menu += `*3. Gótico:* \n${f.gothic}\n\n`;
        menu += `> ✎ *Copia el estilo que prefieras.* ♪`;

        await m.reply(menu);
    }
};
