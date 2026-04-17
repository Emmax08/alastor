// Archivo: ./commands/proteccion.js
export const groupUpdateProtection = async (sock, anu) => {
    try {
        const { id, participants, action, author } = anu;
        
        // Acceder a la base de datos global de tu bot
        const chat = global.db.data.chats[id];
        if (!chat || !chat.proteccion) return; 

        const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        if (!author || author === botJid) return;

        const metadata = await sock.groupMetadata(id);
        const victim = participants[0];

        if (action === 'demote') {
            if (author !== metadata.owner && chat.permisoDemote !== victim) {
                // Acción automática: Sacar al agresor y devolver admin
                await sock.groupParticipantsUpdate(id, [author], 'remove');
                await sock.groupParticipantsUpdate(id, [victim], 'promote');
                
                await sock.sendMessage(id, { 
                    text: `🎙️ *RADIO ALASTOR:* @${author.split('@')[0]} ha intentado un golpe de estado. ¡Sintonizando su eliminación! ♪`,
                    mentions: [author, victim]
                });
            } else {
                chat.permisoDemote = null; // Limpiar el permiso si se usó legalmente
            }
        }

        if (action === 'remove' && author !== metadata.owner && author !== victim) {
            // Protección contra expulsiones no autorizadas
            await sock.groupParticipantsUpdate(id, [author], 'remove');
            await sock.sendMessage(id, { 
                text: `📻 @${author.split('@')[0]} sacó a alguien sin permiso. ¡El espectáculo no acepta groserías!`,
                mentions: [author]
            });
        }
    } catch (e) {
        console.error("Error en la frecuencia de protección:", e);
    }
};

// El comando para activar/desactivar (para tu handler)
export default {
    command: ['proteccion', 'permiso'],
    category: 'admin',
    run: async (sock, m, args, usedPrefix, command) => {
        const chat = global.db.data.chats[m.chat];
        if (command === 'proteccion') {
            if (args[0] === 'on') {
                chat.proteccion = true;
                m.reply('🎙️ *SINTONIZANDO:* Protección de administradores activada.');
            } else if (args[0] === 'off') {
                chat.proteccion = false;
                m.reply('📻 *AVISO:* Protección desactivada.');
            } else {
                m.reply(`🎙️ Estado: ${chat.proteccion ? 'ON' : 'OFF'}\nUsa: ${usedPrefix + command} on/off`);
            }
        }
        if (command === 'permiso') {
            let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
            if (!target) return m.reply('📻 Menciona a quién permites degradar.');
            chat.permisoDemote = target;
            m.reply(`✅ Permiso concedido para degradar a @${target.split('@')[0]}.`, { mentions: [target] });
        }
    }
};
