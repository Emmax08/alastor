import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

// 🗂️ LISTA DE CREADORES (Tu lista original)
const creatorsList = [
    { id: 'owner1', name: '𓅓𝙀𝙈𝙈𝘼𝙓𝓈®', number: '12892581751', rango: 'Creador de la bot' },
    { id: 'owner2', name: 'FÉLIX OFC', number: '573235915041', rango: 'Editor y Desarrollador' },
    { id: 'owner3', name: 'Dioneibi-rip', number: '18294868853', rango: 'Editor y Desarrollador' },
    { id: 'owner4', name: 'Arlette Xz', number: '573114910796', rango: 'Desarrolladora Principal y Corregidora de Errores' },
    { id: 'owner5', name: 'Nevi Dev', number: '18096758983', rango: 'Desarrollador Principal' }
]

const creatorsMap = creatorsList.reduce((acc, creator) => {
    acc[creator.id] = creator
    acc[creator.name.toLowerCase()] = creator
    return acc
}, {})

// CAMBIO AQUÍ: Usamos "export default { run: async ... }" para que tu handler lo encuentre
export default {
    command: ['owner', 'creador', 'contacto', 'creadora'],
    category: 'info',
    run: async (conn, m) => {
      try {
        const isGroup = m.chat.endsWith('@g.us')
        const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net'
        
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

      } catch (e) {
        console.error('❌ Error en el comando owner:', e)
        const backupText = `*❌ Ocurrió un error al enviar los contactos:*\n\n` +
          creatorsList.map(c => `• *${c.name}* (${c.rango}): https://wa.me/${c.number}`).join('\n')
        await conn.sendMessage(m.chat, { text: backupText }, { quoted: m })
      }
    },

    // El handler.before se queda igual, pero dentro del objeto exportado
    before: async (m, { conn }) => {
      try {
        const isGroup = m.chat.endsWith('@g.us')
        let buttonId = null
        
        if (!isGroup) {
            buttonId = m.message?.interactiveResponseMessage?.selectedButtonId || m.text
        } else {
            const textLower = m.text?.toLowerCase()
            if (creatorsMap[textLower]) buttonId = textLower
        }

        if (!buttonId) return
        const creator = creatorsMap[buttonId]
        
        if (creator) {
          await conn.sendMessage(m.chat, { 
            text: `*✅ Contacto Seleccionado*\n\n👤 Nombre: ${creator.name}\n🎖️ Rango: ${creator.rango}`
          }, { quoted: m })

          await conn.sendMessage(m.chat, {
            contacts: {
              contacts: [{
                displayName: creator.name,
                vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${creator.name}\nTEL;type=CELL;type=VOICE;waid=${creator.number}:+${creator.number}\nEND:VCARD`
              }]
            }
          }, { quoted: m })
        }
      } catch (error) {
        console.error('Error en before:', error)
      }
    }
}
