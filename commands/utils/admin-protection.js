import fs from 'fs';

export default {
    command: ['proteccion', 'adminlock', 'permiso'],
    category: 'admin',
    run: async (client, m, args, usedPrefix, command, text) => {
        if (!m.isGroup) return m.reply('🎙️ Este comando solo es para transmisiones grupales.');
        
        // Cargar base de datos (asegúrate de que la ruta sea correcta)
        const path = './database/chats.json';
        if (!fs.existsSync('./database')) fs.mkdirSync('./database');
        if (!fs.existsSync(path)) fs.writeFileSync(path, '{}');
        
        let chatData = JSON.parse(fs.readFileSync(path, 'utf-8'));
        const groupId = m.chat;
        const isOwner = m.key.fromMe; // O tu lógica de Owner
        const groupMetadata = await client.groupMetadata(groupId);
        const admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);
        const isAdmin = admins.includes(m.sender);

        if (!isAdmin && !isOwner) {
            return m.reply('🎙️ *INTERFERENCIA:* Solo los directores de la estación (admins) pueden alterar la configuración. ♪');
        }

        // INICIO DE LA LÓGICA DE COMANDOS
        if (command === 'proteccion') {
            if (!args[0]) return m.reply(`📻 *RADIO ALASTOR: SEGURIDAD* 🎙️\n\nEstado: *${chatData[groupId]?.proteccion ? 'ON' : 'OFF'}*\n\nUsa:\n${usedPrefix}proteccion on\n${usedPrefix}proteccion off`);

            if (args[0] === 'on') {
                chatData[groupId] = { ...chatData[groupId], proteccion: true, permisoDemote: null };
                m.reply('🎙️ *SINTONIZANDO:* Protección activada. Cualquier cambio de rango no autorizado será castigado. ♪');
            } else {
                chatData[groupId] = { ...chatData[groupId], proteccion: false };
                m.reply('📻 *AVISO:* Protección desactivada. La frecuencia está abierta... bajo su propio riesgo.');
            }
        }

        if (command === 'permiso') {
            if (!chatData[groupId]?.proteccion) return m.reply('🎙️ No puedes pedir permiso si la protección está apagada.');
            
            let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
            if (!target) return m.reply(`📻 *RADIO ALASTOR:* Menciona a quién deseas degradar legalmente.\n\n> *Ejemplo:* ${usedPrefix}permiso @user`);

            // Guardamos temporalmente quién tiene permiso de ser degradado
            chatData[groupId].permisoDemote = target;
            m.reply(`🎙️ *PERMISO CONCEDIDO:* Se ha autorizado la degradación de @${target.split('@')[0]}. Tienes 1 minuto para hacerlo manualmente.`, { mentions: [target] });

            // El permiso expira en 60 segundos para evitar vulnerabilidades
            setTimeout(() => {
                let currentData = JSON.parse(fs.readFileSync(path, 'utf-8'));
                if (currentData[groupId]) {
                    currentData[groupId].permisoDemote = null;
                    fs.writeFileSync(path, JSON.stringify(currentData, null, 2));
                }
            }, 60000);
        }

        fs.writeFileSync(path, JSON.stringify(chatData, null, 2));
    }
};

/** * LÓGICA PARA TU EVENTO DE GRUPO (Colocar en group-participants.update)
 * Esta es la parte que evita los "bugs" actuando solo cuando debe.
 */
export const groupUpdateProtection = async (client, anu) => {
    const { id, participants, action, author } = anu;
    const path = './database/chats.json';
    if (!fs.existsSync(path)) return;

    let chatData = JSON.parse(fs.readFileSync(path, 'utf-8'));
    if (!chatData[id]?.proteccion) return;

    const botNumber = client.user.id.split(':')[0] + '@s.whatsapp.net';
    if (!author || author === botNumber) return;

    const metadata = await client.groupMetadata(id);
    const victim = participants[0];

    // Si alguien intenta quitar admin (demote)
    if (action === 'demote') {
        // ¿Tiene permiso previo?
        if (chatData[id].permisoDemote === victim) {
            // Limpiar permiso una vez usado
            chatData[id].permisoDemote = null;
            fs.writeFileSync(path, JSON.stringify(chatData, null, 2));
            return; // Permitir la acción
        }

        // Si NO tiene permiso y no es el Dueño Total del grupo
        if (author !== metadata.owner) {
            await client.groupParticipantsUpdate(id, [author], 'remove'); // Sacar al traidor
            await client.groupParticipantsUpdate(id, [victim], 'promote'); // Devolver admin a la víctima
            
            await client.sendMessage(id, { 
                text: `🎙️ *¡TRAICIÓN DETECTADA!* 📻\n\n@${author.split('@')[0]} intentó degradar a un colega sin mi permiso. \n\n> _¡Disfruta del silencio del vacío!_ ♪`,
                mentions: [author, victim]
            });
        }
    }

    // Si alguien intenta sacar a un admin (remove)
    if (action === 'remove' && author !== metadata.owner) {
        // Aquí podrías verificar si 'victim' era admin (usando una lista guardada)
        // Por ahora, saca a cualquiera que use el 'ban' sin ser el Dueño.
        await client.groupParticipantsUpdate(id, [author], 'remove');
        await client.sendMessage(id, { text: `📻 Alguien ha sido muy travieso... Adiós, @${author.split('@')[0]}.`, mentions: [author] });
    }
};
