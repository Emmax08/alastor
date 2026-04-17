import fs from 'fs';

export const groupUpdateProtection = async (sock, anu) => {
    try {
        const { id, participants, action, author } = anu;
        
        // Cargar datos del chat
        const chat = global.db.data.chats[id];
        if (!chat || !chat.proteccion) return; 

        const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // Filtro de seguridad: Si no hay autor o el autor es el propio bot, ignorar.
        if (!author || author === botJid) return;

        const metadata = await sock.groupMetadata(id);
        const victim = participants[0];

        // 1. CASO: QUITAN ADMIN (DEMOTE)
        if (action === 'demote') {
            // Si el agresor no es el dueño del grupo y no tiene permiso especial
            if (author !== metadata.owner && chat.permisoDemote !== victim) {
                
                // Paso 1: Devolver admin a la víctima de inmediato
                await sock.groupParticipantsUpdate(id, [victim], 'promote');
                
                // Paso 2: Pequeña pausa para evitar que el servidor de WA se colapse
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Paso 3: Expulsar al agresor
                await sock.groupParticipantsUpdate(id, [author], 'remove');
                
                await sock.sendMessage(id, { 
                    text: `RADIO ALASTOR: Intento de golpe de estado fallido. @${victim.split('@')[0]} recupera su puesto. El traidor @${author.split('@')[0]} ha sido expulsado.`,
                    mentions: [author, victim]
                });
            } else {
                chat.permisoDemote = null; 
            }
        }

        // 2. CASO: ELIMINAN A ALGUIEN (REMOVE)
        if (action === 'remove' && author !== metadata.owner && author !== victim) {
            // Si el bot detecta que un admin expulsó a alguien sin ser el dueño
            // El bot procede a eliminar al ejecutor por seguridad
            await sock.groupParticipantsUpdate(id, [author], 'remove');
            
            await sock.sendMessage(id, { 
                text: `RADIO ALASTOR: @${author.split('@')[0]} ha tomado decisiones sin consultar. Se le ha retirado del grupo por insubordinación.`,
                mentions: [author]
            });
        }
    } catch (e) {
        // Solo loguear el error sin detener el proceso
        console.log("Error en protección de grupo:", e.message);
    }
};

export default {
    command: ['proteccion', 'permiso'],
    category: 'admin',
    run: async (sock, m, args, usedPrefix, command) => {
        const chat = global.db.data.chats[m.chat];
        
        if (command === 'proteccion') {
            if (args[0] === 'on') {
                chat.proteccion = true;
                m.reply('SINTONIZANDO: Proteccion de admins activada.');
            } else if (args[0] === 'off') {
                chat.proteccion = false;
                m.reply('AVISO: Proteccion desactivada.');
            } else {
                m.reply(`Estado: ${chat.proteccion ? 'ON' : 'OFF'}\nUsa: ${usedPrefix + command} on/off`);
            }
        }

        if (command === 'permiso') {
            let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
            if (!target) return m.reply('Menciona a quien permites degradar.');
            chat.permisoDemote = target;
            m.reply(`Permiso concedido para degradar a @${target.split('@')[0]} una vez.`, { mentions: [target] });
        }
    }
};
