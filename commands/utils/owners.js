import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

// 🗂️ LISTA DE CREADORES
const creatorsList = [
    { id: 'owner1', name: '𓅓𝙀𝙈ΜΑ𝙓𝓈®', number: '12892581751', rango: 'Creador de la bot' },
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

export default {
    command: ['owner', 'creador', 'contacto', 'creadora'],
    category: 'info',
    run: async (conn, m, args) => {
      // Si el usuario envió el comando solo, mostramos el menú de botones
      if (!args[0]) {
        try {
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
          return await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
        } catch (e) {
          console.error('Error al enviar botones:', e)
        }
      }

      // LÓGICA DE RESPUESTA (Si el mensaje es el nombre de un creador)
      const input = args.join(' ').toLowerCase()
      const creator = creatorsMap[input] || creatorsMap[m.text.toLowerCase()]

      if (creator) {
        await conn.sendMessage(m.chat, { 
          text: `*✅ Contacto Seleccionado*\n\n👤 Nombre: ${creator.name}\n🎖️ Rango: ${creator.rango}`
        }, { quoted: m })

        await conn.sendMessage(m.chat, {
          contacts: {
            displayName: creator.name,
            contacts: [{
              displayName: creator.name,
              vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${creator.name}\nTEL;type=CELL;type=VOICE;waid=${creator.number}:+${creator.number}\nEND:VCARD`
            }]
          }
        }, { quoted: m })
      }
    }
}