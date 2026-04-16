export default {
    command: ['owner', 'owners', 'dueños'],
    category: 'main',
    run: async (client, m, { conn }) => {
        const botJid = client.user.id.split(':')[0] + '@s.whatsapp.net';
        const settings = global.db.data.settings[botJid] || {};
        
        // --- [ RECOPILACIÓN DE DUEÑOS ] ---
        // Combinamos el owner de settings + los de global.owner
        const ownersList = [
            ...(settings.owner ? [settings.owner] : []),
            ...global.owner
        ];

        // Eliminamos duplicados y formateamos el JID
        const uniqueOwners = [...new Set(ownersList)].map(num => 
            num.includes('@s.whatsapp.net') ? num : `${num.replace(/[^0-9]/g, '')}@s.whatsapp.net`
        );

        // --- [ CONSTRUCCIÓN DEL MENÚ ] ---
        let menu = `📻 *STAFF DE RADIO ALASTOR* 🎙️\n\n`;
        menu += `> *Estado:* Transmisión Segura ♪\n\n`;

        if (uniqueOwners.length === 0) {
            menu += `*— No hay dueños registrados —*`;
        } else {
            uniqueOwners.forEach((owner, index) => {
                const snumber = owner.split('@')[0];
                // Aquí puedes editar los nombres manualmente como pediste
                let nickname = "Dueño Principal"; 
                if (index > 0) nickname = `Staff Elite ${index}`;

                menu += `*${index + 1}.* @${snumber}\n`;
                menu += `   ╰ *Rango:* ${nickname}\n`;
            });
        }

        menu += `\n> ✎ *Cualquiera de ellos puede ajustar tu frecuencia.* ♪`;

        // Enviamos el mensaje con menciones para que se vean los números
        await client.sendMessage(m.chat, {
            text: menu,
            contextInfo: {
                mentionedJid: uniqueOwners,
                externalAdReply: {
                    title: '【 📻 Ｏｗｎｅｒｓ  Ｌｉｓｔ 】',
                    body: 'Personal con acceso a la cabina...',
                    thumbnailUrl: 'https://i.imgur.com/u8M6X1h.png', // Tu imagen de Alastor
                    sourceUrl: 'https://github.com/Emmax08',
                    mediaType: 1,
                    showAdAttribution: true
                }
            }
        }, { quoted: m });
    }
};
