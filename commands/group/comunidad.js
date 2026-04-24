// --- [ LÓGICA DE MEMBRESÍA REFORZADA ] ---
async function esMiembroComunidad(sock, usuario) {
  const ahora = Date.now();
  try {
    // Si la lista está vacía o pasaron 5 min, cargamos
    if (cacheMiembros.length === 0 || (ahora - ultimaCarga > 5 * 60 * 1000)) { 
      const metadata = await sock.groupMetadata(ID_COMUNIDAD).catch(() => null);
      if (metadata) {
        cacheMiembros = metadata.participants.map(p => p.id);
        ultimaCarga = ahora;
      }
    }

    // [ SOLUCIÓN AL BUG ] 
    // Si NO aparece en la lista guardada, forzamos una comprobación individual 
    // antes de decir que no es miembro.
    if (!cacheMiembros.includes(usuario)) {
      const freshMetadata = await sock.groupMetadata(ID_COMUNIDAD).catch(() => null);
      if (freshMetadata) {
        cacheMiembros = freshMetadata.participants.map(p => p.id);
        return cacheMiembros.includes(usuario);
      }
    }

    return cacheMiembros.includes(usuario);
  } catch (e) {
    console.log(chalk.yellow("[ Membresía ] Error al validar, saltando restricción..."));
    return true; 
  }
}

// --- [ EVENTO UPSERT ACTUALIZADO ] ---
sock.ev.on('messages.upsert', async (chatUpdate) => {
  try {
    const kay = chatUpdate.messages[0];
    if (!kay?.message) return;
    if (kay.key?.remoteJid === 'status@broadcast') return;
    kay.message = Object.keys(kay.message)[0] === 'ephemeralMessage' ? kay.message.ephemeralMessage.message : kay.message;
    if (kay.key.fromMe && kay.key.id.startsWith('3EB0')) return;
    
    const m = await smsg(sock, kay);
    if (!m || m.key.fromMe) return;

    const body = (m.text || "").toLowerCase();
    const prefixes = ['.', '#', '/', '!', 'yuki']; 
    const isCommand = prefixes.some(p => body.startsWith(p));

    if (isCommand) {
      // Validamos miembro con la doble comprobación
      const permitido = await esMiembroComunidad(sock, m.sender);
      
      if (!permitido) {
        return await sock.sendMessage(m.chat, { 
          text: `⚠️ *ACCESO DENEGADO*\n\nHola @${m.sender.split('@')[0]}, el sistema no te detecta en la comunidad oficial.\n\n🔗 *Si ya estás dentro, ignora este mensaje y vuelve a intentar el comando.*\n\n*Link:* https://chat.whatsapp.com/TuLinkAqui`,
          mentions: [m.sender]
        }, { quoted: m });
      }
    }

    msgQueue.push(main(sock, m, chatUpdate));
    drainQueue();
  } catch (err) {
    console.log(chalk.red('Error en index.js:'), err);
  }
});
