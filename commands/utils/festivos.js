export default {
    command: ['festividades', 'festividad', 'hoyquees'],
    category: 'utils',
    run: async (client, m, { conn }) => {
        // 1. Configuración de la fecha actual (Ciudad de México)
        const hoy = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Mexico_City"}));
        const dia = hoy.getDate();
        const mes = hoy.getMonth() + 1;
        const fechaActual = `${dia}/${mes}`;

        // 2. Diccionario de fechas importantes
        const efemerides = {
            "1/1": "¡Feliz Año Nuevo! 🎆 Un nuevo comienzo para sintonizar nuestra radio favorita.",
            "14/2": "¡Feliz 14 de febrero! ❤️ El amor y la amistad están en el aire. ¡Espero que se la pasen de maravilla, queridos pecadores! ♪",
            "10/5": "¡Feliz Día de las Madres! 💐 Un saludo cordial de Alastor para todas las jefecitas del grupo.",
            "15/9": "¡VIVA MÉXICO! 🇲🇽 Saquen el tequila y el pozole, ¡es hora de celebrar a lo grande!",
            "1/11": "Día de Muertos 💀 Una fecha especial para recordar a los que ya no están con nosotros.",
            "24/12": "¡Feliz Nochebuena! 🎄 Que el espectáculo comience antes de la cena familiar.",
            "25/12": "¡Feliz Navidad! 🎁 Disfruten de sus regalos y de la compañía de sus seres queridos.",
            "31/12": "¡Fin de Año! 🥂 Gracias por sintonizar Alastor-Bot este año. ¡Nos vemos en el próximo!"
        };

        // 3. Verificamos si hoy hay algo que celebrar
        if (efemerides[fechaActual]) {
            // Obtenemos a todos los participantes para la mención
            const groupMetadata = m.isGroup ? await client.groupMetadata(m.chat) : null;
            const participants = groupMetadata ? groupMetadata.participants.map(p => p.id) : [];

            let textoAnuncio = `📻 *ANUNCIO DE ALASTOR* 🎙️\n\n`;
            textoAnuncio += `${efemerides[fechaActual]}\n\n`;
            textoAnuncio += `> _Atentamente: Su anfitrión de la radio_ ♪`;

            await client.sendMessage(m.chat, {
                text: textoAnuncio,
                mentions: participants // Esto etiqueta a todos si es un grupo
            }, { quoted: m });

        } else {
            // Si no hay festividad registrada para hoy
            await m.reply(`📻 *RADIO ALASTOR* 🎙️\n\nHoy *${dia}/${mes}* no tengo ninguna festividad importante registrada en mi sintonía. ¡Pero siempre es un buen día para un poco de caos! ♪`);
        }
    }
};
