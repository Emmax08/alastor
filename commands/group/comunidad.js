  sock.ev.on('messages.upsert', async (chatUpdate) => {
    try {
      const kay = chatUpdate.messages[0];
      if (!kay?.message) return;
      if (kay.key?.remoteJid === 'status@broadcast') return;
      kay.message = Object.keys(kay.message)[0] === 'ephemeralMessage' ? kay.message.ephemeralMessage.message : kay.message;
      if (kay.key.fromMe && kay.key.id.startsWith('3EB0')) return;
      
      const m = await smsg(sock, kay);

      // --- [ FILTRO DE MEMBRESÍA MEJORADO ] ---
      const bodyText = m.text || "";
      // Agregamos '/' a los prefijos para que detecte '/p'
      const prefixes = ['.', '#', '/']; 
      const startsWithPrefix = prefixes.some(p => bodyText.startsWith(p));

      if (startsWithPrefix) {
        try {
          const esUsuarioValido = await verificarMembresia(sock, m.sender);
          
          if (!esUsuarioValido) {
            return await sock.sendMessage(m.chat, { 
              text: `❌ *ACCESO DENEGADO*\n\nHola @${m.sender.split('@')[0]}, para usar mis comandos debes unirte a nuestra comunidad oficial.\n\n🔗 *Únete aquí:* https://chat.whatsapp.com/KQC4pmJF2IvHfVbvUZS2XO`,
              mentions: [m.sender]
            }, { quoted: m });
          }
        } catch (e) {
          // Si falla la verificación por error de red o ID, dejamos que el bot responda normalmente
          console.log("Error silencioso en membresía, permitiendo comando...");
        }
      }
      // -----------------------------------------

      msgQueue.push(main(sock, m, chatUpdate));
      drainQueue();
    } catch (err) {
      console.log(log.error('Error en upsert:'), err);
    }
  });
