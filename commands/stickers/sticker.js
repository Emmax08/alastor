export default {
  command: ['sticker', 's'],
  category: 'stickers',
  run: async (client, m, args, usedPrefix, command) => {
    // Asegurar que la carpeta tmp exista
    const tmpDir = './tmp';
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    try {
      if (args && args[0] === '-list') {
        let helpText = `📻 🎙️ *𝗖𝗔𝗧𝗔𝗟𝗢𝗚𝗢 𝗗𝗘 𝗘𝗦𝗧𝗔𝗠𝗣𝗔𝗗𝗢𝗦* 🎙️ 📻\n\n` +
          `🎭 *𝗙𝗼𝗿𝗺𝗮𝘀 𝗗𝗶𝘀𝗽𝗼𝗻𝗶𝗯𝗹𝗲𝘀:*\n` +
          `➔ *-c* : Círculo de la Radio\n` +
          `➔ *-t* : Triángulo del Destino\n` +
          `➔ *-r* : Esquinas Suaves\n\n` +
          `🎙️ *Ejemplo:* _${usedPrefix + command} -c Pack | Alastor_`;
        return m.reply(helpText);
      }

      const quoted = m.quoted ? m.quoted : m;
      const mime = (quoted.msg || quoted).mimetype || '';
      
      const db = global.db.data.users[m.sender] || {};
      const name = db.name || 'Espectador';
      let pack = `📻 𝖱𝖺𝖽𝗂𝗈 𝖣𝖾𝗆𝗈𝗇 𝖲𝗍𝗂𝖼𝗄𝖾𝗋𝗌`;
      let author = `🎙️ 𝖠𝗅𝖺𝗌𝗍𝗈 r - ${name}`;

      if (args) {
        let filteredText = args.join(' ').replace(/-\w+/g, '').trim();
        let marca = filteredText.split(/[|]/).map(part => part.trim());
        if (marca[0]) pack = marca[0];
        if (marca[1]) author = marca[1];
      }

      const shapeArgs = { '-c': 'circle', '-t': 'triangle', '-r': 'roundrect', '-v': 'heart' };
      const effectArgs = { '-blur': 'blur', '-sepia': 'sepia', '-grayscale': 'grayscale', '-invert': 'invert' };
      
      const effects = [];
      for (const arg of args) {
        if (shapeArgs[arg]) effects.push({ type: 'shape', value: shapeArgs[arg] });
        else if (effectArgs[arg]) effects.push({ type: 'effect', value: effectArgs[arg] });
      }

      const processWithFFmpeg = async (inputPath) => {
        const outputPath = path.join(tmpDir, `out-${Date.now()}.webp`);
        const vf = buildFFmpegFilters(effects);
        
        const ffmpegArgs = [
          '-y', '-analyzeduration', '20M', '-probesize', '20M',
          '-i', inputPath, 
          '-vf', vf, 
          '-loop', '0', '-pix_fmt', 'yuva420p',
          '-c:v', 'libwebp', '-q:v', '70',
          '-fps_mode', 'passthrough', outputPath
        ];
        
        return new Promise((resolve, reject) => {
          const p = spawn('ffmpeg', ffmpegArgs);
          let errLog = '';
          p.stderr.on('data', (d) => errLog += d.toString());
          p.on('close', (code) => {
            if (code === 0 && fs.existsSync(outputPath)) {
              const data = fs.readFileSync(outputPath);
              fs.unlinkSync(outputPath);
              resolve(data);
            } else {
              reject(new Error(errLog.slice(-100) || 'Error desconocido en FFmpeg'));
            }
          });
        });
      };

      if (/image|webp|video/.test(mime)) {
        let buffer = await quoted.download();
        const ext = /video/.test(mime) ? 'mp4' : 'webp';
        const inputPath = path.join(tmpDir, `in-${Date.now()}.${ext}`);
        fs.writeFileSync(inputPath, buffer);
        
        const webpBuffer = await processWithFFmpeg(inputPath);
        const stickerPath = await writeExif({ mimetype: 'image/webp', data: webpBuffer }, { packname: pack, author: author });
        
        await client.sendMessage(m.chat, { sticker: { url: stickerPath } }, { quoted: m });
        
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(stickerPath)) fs.unlinkSync(stickerPath);
      } else {
        return m.reply('🎙️ Responde a una imagen o video.');
      }

    } catch (e) {
      console.error('ERROR STICKER:', e);
      // Ahora sí capturamos el error real o un mensaje por defecto
      const errorMsg = e.message || "Fallo en la transmisión";
      await m.reply(`📻 *¡CRASH!* La estática nos invade... \n> [Error: *${errorMsg.trim()}*]`);
    }
  }
};

const buildFFmpegFilters = (effects) => {
  const W = 512, H = 512;
  let filters = [`scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba`];

  for (const e of effects) {
    if (e.value === 'sepia') filters.push('colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131');
    if (e.value === 'blur') filters.push('gblur=sigma=2');
    if (e.value === 'grayscale') filters.push('hue=s=0');
  }

  const shape = effects.find(e => e.type === 'shape')?.value;
  if (shape === 'circle') filters.push(`geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(lte((X-256)*(X-256)+(Y-256)*(Y-256),256*256),255,0)'`);
  if (shape === 'roundrect') filters.push(`geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(and(lte(abs(X-256),225),lte(abs(Y-256),225)),255,0)'`);

  return filters.join(',');
};
