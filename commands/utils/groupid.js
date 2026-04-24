export default {
    command: ['id', 'groupid', 'jid'],
    category: 'tools',
    run: async (client, m) => {
        // m.chat contiene el ID del grupo o chat actual
        const id = m.chat;
        
        await m.reply(`🆔 *ID de este chat:* \n\n${id}`);
    }
}
