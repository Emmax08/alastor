import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

// 🗂️ CONSOLIDACIÓN DE DATOS: Define la lista de creadores una sola vez.
const creatorsList = [
    { 
      id: 'owner1',
      name: '𓅓𝙀𝙈𝙈𝘼𝙓𝓈®', 
      number: '12892581751',
      rango: 'Creador de la bot'
    },
    { 
      id: 'owner2',
      name: 'FÉLIX OFC', 
      number: '573235915041',
      rango: 'Editor y Desarrollador'
    },
    { 
      id: 'owner3',
      name: 'Dioneibi-rip', 
      number: '18294868853',
      rango: 'Editor y Desarrollador'
    },
    { 
      id: 'owner4',
      name: 'Arlette Xz', 
      number: '573114910796',
      rango: 'Desarrolladora Principal y Corregidora de Errores'
    },
    { 
      id: 'owner5',
      name: 'Nevi Dev', 
      number: '18096758983',
      rango: 'Desarrollador Principal'
    }
]

const creatorsMap = creatorsList.reduce((acc, creator) => {
    acc[creator.id] = creator
    acc[creator.name.toLowerCase()] = creator
    return acc
}, {})


let handler = async (m, { conn }) => {
  try {
    const isGroup = m.chat.endsWith('@g.us')
    
    // --- LÓGICA DE EXTRACCIÓN DE SETTINGS ---
    const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net'
    const settings = global.db.data.settings[botJid] || {}
    
    // Puedes usar 'settings' aquí si quisieras dinamizar el texto, 
    // pero mantenemos tu diseño intacto.
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
    
    const backupText = `*❌ Ocurrió un error al enviar los contactos. Usa los siguientes enlaces de contacto directo:*\n\n` +
      creatorsList.map(c => `• *${c.name}* (${c.rango}): https://wa.me/${c.number}`).join('\n')
    
    await conn.sendMessage(m.chat, { 
      text: backupText
    }, { quoted: m })
  }
}

handler.before = async (m, { conn }) => {
  try {
    const isGroup = m.chat.endsWith('@g.us')
    const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net'
    const settings = global.db.data.settings[botJid] || {}

    let buttonId = null
    
    if (!isGroup) {
        buttonId = m.message?.interactiveResponseMessage?.selectedButtonId || m.text
    } 
    
    if (isGroup) {
        const textLower = m.text.toLowerCase()
        if (creatorsMap[textLower] && m.isBot) {
            buttonId = textLower
        } else if (creatorsMap[textLower]) {
             buttonId = textLower
        } else {
             buttonId = m.text
        }
    }

    if (!buttonId) return
    
    const creator = creatorsMap[buttonId]
    
    if (creator) {
      // Usamos la lógica de settings para validar si el contacto seleccionado 
      // coincide con el owner principal configurado, si fuera necesario.
      
      await conn.sendMessage(m.chat, { 
        text: `*✅ Contacto Seleccionado*\n\n👤 Nombre: ${creator.name}\n🎖️ Rango: ${creator.rango}`
      }, { 
        quoted: m 
      })

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
    console.error('Error en handler.before (respuesta de botón):', error)
  }
}

handler.help = ['owner', 'creador']
handler.tags = ['info']
handler.command = ['owner', 'creador', 'contacto', 'creadora']

export default handler
