import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

const creatorsList = [
    { name: 'Nevi Dev', number: '18096758983', rango: 'Desarrollador Principal' },
    { name: 'DuarteXV', number: '573135180876', rango: 'Tester de errores' },
    { name: 'Arlette Xz', number: '573114910796', rango: 'Desarrolladora' }
]

const handler = {
    command: ['owner', 'creador', 'contacto', 'creadora'],
    category: 'info',

    run: async (conn, m) => {
        const listText = `*LISTA DE CONTACTOS OFICIALES*\n\n` + 
                         creatorsList.map(c => `👤 *${c.name}*\n🎖️ ${c.rango}`).join('\n\n---\n\n')

        // Preparamos las VCards de todos los contactos
        const contacts = creatorsList.map(c => {
            return {
                vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${c.name}\nTEL;type=CELL;type=VOICE;waid=${c.number}:+${c.number}\nEND:VCARD`
            }
        })

        // 1. Enviamos el texto informativo con la imagen
        await conn.sendMessage(m.chat, {
            image: { url: 'https://files.catbox.moe/d2b1e8.jpg' },
            caption: listText
        }, { quoted: m })

        // 2. Enviamos las tarjetas de contacto
        await conn.sendMessage(m.chat, {
            contacts: {
                displayName: 'Contactos Oficiales',
                contacts: contacts
            }
        }, { quoted: m })
    }
}

export default handler