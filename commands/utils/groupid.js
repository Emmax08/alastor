export default {
    command: ['id', 'groupid'],
    category: 'tools',
    run: async (client, m, args) => {
        try {
            const text = args ? args.join(' ') : '';
            
            // Si no hay link, devuelve el ID del chat actual
            if (!text) {
                return m.reply(`🆔 *ID de este chat:* \n\n${m.chat}`);
            }

            // Validar que sea un link de WhatsApp
            if (!text.includes('chat.whatsapp.com/')) {
                return m.reply('❌ Por favor, proporciona un enlace de grupo válido.');
            }

            // Extraer el código de invitación del link
            const code = text.split('chat.whatsapp.com/')[1];

            // Obtener información del grupo sin unirse
            // Nota: El bot debe tener una conexión activa y estable
            const info = await client.groupGetInviteInfo(code);

            if (info) {
                await m.reply(`✅ *Información del Grupo Extratida:*
                
📌 *Nombre:* ${info.subject}
🆔 *ID:* ${info.id}@g.us
👤 *Creador:* ${info.owner || 'No detectado'}
📅 *Creado:* ${new Date(info.creation * 1000).toLocaleString()}`);
            } else {
                throw new Error("No se pudo obtener la info");
            }

        } catch (e) {
            console.error(e);
            await m.reply('❌ *Error:* No pude obtener el ID. Asegúrate de que el link sea válido o que el bot no haya sido bloqueado de ese grupo.');
        }
    }
}
