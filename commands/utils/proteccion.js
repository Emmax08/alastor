import fs from 'fs';

/**
 * LÓGICA AUTOMÁTICA DE PROTECCIÓN MEJORADA
 * Se han eliminado funciones que causaban la salida del bot.
 */
export const groupUpdateProtection = async (sock, anu) => {
    try {
        const { id, participants, action, author } = anu;
        
        // Acceso a la base de datos global
        const chat = global.db.data.chats[id];
        if (!chat || !chat.proteccion) return; 

        const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // 1. Evitar que el bot se afecte a sí mismo o actúe por sus propias acciones
        if (!author || author === botJid) return;

        const metadata = await sock.groupMetadata(id);
        const victim = participants[0];

        // 2. DETECCIÓN DE DEGRADACIÓN (QUITAR ADMIN)
        if (action === 'demote') {
            // Si el que quitó el admin NO es el dueño y NO hay permiso especial
            if (author !== metadata.owner && chat.permisoDemote !== victim) {
                
                // ORDEN DE ACCIÓN:
                // Primero: Devolver el admin a la víctima (Promote)
                await sock.groupParticipantsUpdate(id, [victim], 'promote');
                
                // Segundo: Eliminar al que causó el conflicto (Remove)
                await sock.groupParticipantsUpdate(id, [author], 'remove');
                
                await sock.sendMessage(id, { 
                    text: `🎙️ RADIO ALASTOR: Intento de traición detectado. @${victim.split('@')[0]} ha recuperado su puesto y el infractor @${author.split('@')[0]} ha sido eliminado. ♪`,
                    mentions: [author, victim]
                });
            } else {
                // Si había permiso, se limpia para la próxima vez
                chat.permisoDemote = null;
            }
        }

        // 3. DETECCIÓN DE EXPULSIÓN (REMOVE)
        // Si alguien expulsa a un admin (o a cualquier miembro con protección ON)
        if (action === 'remove' && author !== metadata.owner && author !== victim) {
            // El bot elimina al que expulsó sin permiso
            await sock.groupParticipantsUpdate(id, [author], 'remove');
            
            await sock.sendMessage(id, { 
                text: `📻 @${author.split('@')[0]} ha osado expulsar a alguien sin mi consentimiento. ¡Fuera de mi vista! ♪`,
                mentions: [author]
            });
        }
    } catch (e) {
        // Log de error simple para no tumbar el proceso
        console.error("Error en frecuencia de proteccion:", e.message);
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
                m.reply('🎙️ SINTONIZANDO: Protección activada.');
            } else if (args[0] === 'off') {
                chat.proteccion = false;
                m.reply('📻 AVISO: Protección desactivada.');
            } else {
                m.reply(`🎙️ Estado actual: ${chat.proteccion ? 'ON' : 'OFF'}\nUsa: ${usedPrefix + command} on/off`);
            }
        }

        if (command === 'permiso') {
            let target = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
            if (!target) return m.reply('📻 Menciona a quien permites degradar legalmente.');
            chat.permisoDemote = target;
            m.reply(`✅ Permiso concedido para degradar a @${target.split('@')[0]}.`, { mentions: [target] });
        }
    }
};
