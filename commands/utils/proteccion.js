import fs from 'fs';

/**
 * LÓGICA AUTOMÁTICA DE PROTECCIÓN
 * Sin imágenes ni URLs para evitar errores de red.
 */
export const groupUpdateProtection = async (sock, anu) => {
    try {
        const { id, participants, action, author } = anu;
        
        // Uso de la base de datos global de Yuki/Alastor
        const chat = global.db.data.chats[id];
        if (!chat || !chat.proteccion) return; 

        const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        if (!author || author === botJid) return;

        const metadata = await sock.groupMetadata(id);
        const victim = participants[0];

        // Detección de degradación (Quitar admin)
        if (action === 'demote') {
            if (author !== metadata.owner && chat.permisoDemote !== victim) {
                
                await sock.groupParticipantsUpdate(id, [author], 'remove');
                await sock.groupParticipantsUpdate(id, [victim], 'promote');
                
                // Mensaje puramente de texto
                await sock.sendMessage(id, { 
                    text: `🎙️ RADIO ALASTOR: Intento de golpe de estado detectado. @${author.split('@')[0]} ha sido eliminado y el orden restaurado. ♪`,
                    mentions: [author, victim]
                });
            } else {
                chat.permisoDemote = null;
            }
        }

        // Detección de expulsión no autorizada
        if (action === 'remove' && author !== metadata.owner && author !== victim) {
            await sock.groupParticipantsUpdate(id, [author], 'remove');
            await sock.sendMessage(id, { 
                text: `📻 @${author.split('@')[0]} expulsó a un miembro sin permiso. He decidido que tú también debes retirarte. ♪`,
                mentions: [author]
            });
        }
    } catch (e) {
        console.error("Error en protección automática:", e);
    }
};

/**
 * COMANDO PARA ACTIVAR/DESACTIVAR
 */
export default {
    command: ['proteccion', 'permiso'],
    category: 'admin',
    run: async (sock, m, args, usedPrefix, command) => {
        const chat = global.db.data.chats[m.chat];
        
        if (command === 'proteccion') {
            if (args[0] === 'on') {
                chat.proteccion = true;
                m.reply('🎙️ SINTONIZANDO: Protección activada.');
            } else if (args[0] === 'off') {
                chat.proteccion = false;
                m.reply('📻 AVISO: Protección desactivada.');
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
