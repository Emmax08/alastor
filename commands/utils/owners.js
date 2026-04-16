import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

const creatorsList = [
    { id: 'owner1', name: '𓅓𝙀𝙈ΜΑ𝙓𝓈®', number: '12892581751', rango: 'Creador de la bot' },
    { id: 'owner2', name: 'FÉLIX OFC', number: '573235915041', rango: 'Editor y Desarrollador' },
    { id: 'owner3', name: 'Dioneibi-rip', number: '18294868853', rango: 'Editor y Desarrollador' },
    { id: 'owner4', name: 'Arlette Xz', number: '573114910796', rango: 'Desarrolladora Principal y Corregidora de Errores' },
    { id: 'owner5', name: 'Nevi Dev', number: '18096758983', rango: 'Desarrollador Principal' }
]

const handler = {
    command: ['owner', 'creador', 'contacto', 'creadora'],
    category: 'info',
    
    // 1. EL COMANDANTE (Envía el menú)
    run: async (conn, m) => {
        const menuText = `*LISTA - CREADORES*\n\n> Selecciona un creador para contactar`
        const buttons = creatorsList.map(creator => ({
            buttonId: creator.id,
            buttonText: { displayText: creator.name },
            type: 1
        }))

        const buttonMessage = {
            text: menuText,
            footer: 'Selecciona un contacto',
            buttons: buttons,
            headerType: 4,
            image: { url: 'https://files.catbox.moe/d2b1e8.jpg' }
        }
        await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
    },

    // 2. EL CENTINELA (Atrapa el clic sin necesidad de prefijo)
    before: async (m, { conn }) => {
        if (!m.text) return false
        
        // Buscamos si el texto del mensaje coincide exactamente con el nombre de un creador
        const selected = creatorsList.find(c => m.text === c.name)
        
        if (selected) {
            // Enviamos el rango
            await conn.sendMessage(m.chat, { 
                text: `*✅ Contacto Seleccionado*\n\n👤 Nombre: ${selected.name}\n🎖️ Rango: ${selected.rango}`
            }, { quoted: m })

            // Enviamos la VCard
            const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${selected.name}\nTEL;type=CELL;type=VOICE;waid=${selected.number}:+${selected.number}\nEND:VCARD`
            
            await conn.sendMessage(m.chat, {
                contacts: {
                    displayName: selected.name,
                    contacts: [{ vcard }]
                }
            }, { quoted: m })
            
            return true // Indica al sistema que ya manejamos este mensaje
        }
        return false
    }
}

export default handler
