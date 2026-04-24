// --- CONFIGURACIÓN FUERA DEL EXPORT ---
const ID_COMUNIDAD = '120363421393028091@g.us'; 
let cacheMiembros = [];
let ultimaCarga = 0;

async function esMiembro(client, usuario) {
    const ahora = Date.now();
    try {
        // Solo actualiza la lista si han pasado más de 5 minutos
        if (ahora - ultimaCarga > 5 * 60 * 1000) {
            const metadata = await client.groupMetadata(ID_COMUNIDAD);
            cacheMiembros = metadata.participants.map(p => p.id);
            ultimaCarga = ahora;
        }
        return cacheMiembros.includes(usuario);
    } catch (e) {
        console.error("Error validando grupo:", e);
        return false;
    }
}

export default {
    command: ['test', 'verificar'],
    category: 'tools',
    run: async (client, m, args) => {
        // 1. Validar membresía
        const unido = await esMiembro(client, m.sender);
        
        if (!unido) {
            return m.reply(`❌ *ACCESO DENEGADO*\n\nPara usar este comando debes estar en la comunidad oficial.\n\n🔗 *Link:* https://chat.whatsapp.com/TuLinkReal`);
        }

        // 2. Si es miembro, responde esto:
        await m.reply('✅ *¡ACCESO CONCEDIDO!* Eres parte de la comunidad y puedes usar mis comandos.');
    }
}
