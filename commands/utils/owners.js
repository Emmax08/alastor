import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

// 🗂️ LISTA DE CREADORES (Mantenemos tu lista intacta)
const creatorsList = [
    { id: 'owner1', name: '𓅓𝙀𝙈ΜΑ𝙓𝓈®', number: '12892581751', rango: 'Creador de la bot' },
    { id: 'owner2', name: 'FÉLIX OFC', number: '573235915041', rango: 'Editor y Desarrollador' },
    { id: 'owner3', name: 'Dioneibi-rip', number: '18294868853', rango: 'Editor y Desarrollador' },
    { id: 'owner4', name: 'Arlette Xz', number: '573114910796', rango: 'Desarrolladora Principal y Corregidora de Errores' },
    { id: 'owner5', name: 'Nevi Dev', number: '18096758983', rango: 'Desarrollador Principal' }
]

export default {
    command: ['owner', 'creador', 'contacto', 'creadora'],
    category: 'info',
    run: async (conn, m, { text }) => {
        const body = m.text.trim();

        // 1. LÓGICA DE DETECCIÓN: ¿El mensaje coincide con el nombre de un creador?
        const selectedCreator = creatorsList.find(c => 
            body.includes(c.name) || 
            (m.message?.buttonsResponseMessage?.selectedButtonId === c.id)
        );

        if (selectedCreator) {
            // ENVIAR INFO DE RANGO
            await conn.sendMessage(m.chat, { 
                text: `*✅ Contacto Seleccionado*\n\n👤 Nombre: ${selectedCreator.name}\n🎖️ Rango: ${selectedCreator.rango}`
            }, { quoted: m });

            // ENVIAR EL CONTACTO (VCARD)
            const vcard = `BEGIN:VCARD\n` +
                          `VERSION:3.0\n` +
                          `FN:${selectedCreator.name}\n` +
                          `TEL;type=CELL;type=VOICE;waid=${selectedCreator.number}:+${selectedCreator.number}\n` +
                          `END:VCARD`;

            await conn.sendMessage(m.chat, {
                contacts: {
                    displayName: selectedCreator.name,
                    contacts: [{ vcard }]
                }
            }, { quoted: m });
            
            return; // Detenemos aquí si ya encontramos al creador
        }

        // 2. SI NO HAY SELECCIÓN, MOSTRAR EL MENÚ (Solo si es el comando principal)
        const menuText = `*LISTA - CREADORES*\n\n> Selecciona un creador para contactar`;
        const buttons = creatorsList.map(creator => ({
            buttonId: creator.id,
            buttonText: { displayText: creator.name },
            type: 1
        }));

        const buttonMessage = {
            text: menuText,
            footer: 'Selecciona un contacto',
            buttons: buttons,
            headerType: 4,
            image: { url: 'https://files.catbox.moe/d2b1e8.jpg' }
        };

        await conn.sendMessage(m.chat, buttonMessage, { quoted: m });
    }
}
