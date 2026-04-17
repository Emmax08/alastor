import fs from 'fs';

// --- ESTA FUNCIÓN SE EJECUTA SOLA CUANDO HAY CAMBIOS EN EL GRUPO ---
export const groupUpdateProtection = async (client, anu) => {
    try {
        const { id, participants, action, author } = anu;
        
        // Accedemos a la base de datos global de tu bot
        const chat = global.db.data.chats[id];
        if (!chat || !chat.proteccion) return; // Si no existe el chat o la protección está OFF, salir.

        const botJid = client.user.id.split(':')[0] + '@s.whatsapp.net';
        if (!author || author === botJid) return;

        const metadata = await client.groupMetadata(id);
        const victim = participants[0];

        // 1. SI QUITAN UN ADMIN (DEMOTE)
        if (action === 'demote') {
            // Si el que lo quitó no es el dueño y no hay permiso especial
            if (author !== metadata.owner && chat.permisoDemote !== victim) {
                
                await client.groupParticipantsUpdate(id, [author], 'remove'); // Fuera el traidor
                await client.groupParticipantsUpdate(id, [victim], 'promote'); // Devolver admin
                
                await client.sendMessage(id, { 
                    text: `🎙️ *RADIO ALASTOR:* @${author.split('@')[0]} ha intentado un golpe de estado. ¡Eliminado! ♪`,
                    mentions: [author, victim]
                });
            } else {
                chat.permisoDemote = null; // Limpiar permiso si ya se usó
            }
        }

        // 2. SI SACAN A UN ADMIN (REMOVE)
        if (action === 'remove' && author !== metadata.owner && author !== victim) {
            // Verificamos si la víctima era admin (opcional, aquí protege a todos si la protección está ON)
            await client.groupParticipantsUpdate(id, [author], 'remove');
            await client.sendMessage(id, { 
                text: `📻 @${author.split('@')[0]} sacó a alguien sin permiso. ¡El espectáculo no acepta groserías!`,
                mentions: [author]
            });
        }
    } catch (e) {
        console.error("Error en protección:", e);
    }
};

// --- ESTE ES EL COMANDO PARA TU MENU (.proteccion on/off) ---
export default {
    command: ['proteccion', 'permiso'],
    category: 'admin',
    isAdmin: true,
    botAdmin: true,
    run: async (client, m, args, usedPrefix, command) => {
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
            m.reply(`✅ Permiso concedido para degradar a @${target.split('@')[0]} por esta única vez.`, { mentions: [target] });
        }
    }
};
