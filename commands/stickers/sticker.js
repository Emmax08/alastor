import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import fetch from 'node-fetch';
import exif from '../../lib/exif.js';
const { writeExif } = exif;

export default {
  command: ['sticker', 's'],
  category: 'stickers',
  run: async (client, m, args, usedPrefix, command) => {
    const tmpDir = './tmp';
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    try {
      if (args && args[0] === '-list') {
        let helpText = `📻 🎙️ *𝗖𝗔𝗧𝗔𝗟𝗢𝗚𝗢 𝗗𝗘 𝗘𝗦𝗧𝗔𝗠𝗣𝗔𝗗𝗢𝗦* 🎙️ 📻\n\n` +
          `🎭 *𝗙𝗼𝗿𝗺𝗮𝘀 𝗗𝗶𝘀𝗽𝗼𝗻𝗶𝗯𝗹𝗲𝘀:*\n` +
          `➔ *-c* : Círculo de la Radio\n` +
          `➔ *-t* : Triángulo del Destino\n` +
          `➔ *-r* : Esquinas Suaves\n` +
          `➔ *-v* : Corazón de Pecador\n\n` +
          `🎙️ *Ejemplo:* _${usedPrefix + command} -c Pack | Alastor_`;
        return m.reply(helpText);
      }

      const quoted = m.quoted ? m.quoted : m;
      const mime = (quoted.msg || quoted).mimetype || '';
      
      if (!/image|webp|video/.test(mime)) {
        return m.reply(`🎙️ *¡Sintonizando!* Responde a una imagen o video.\n> Usa *${usedPrefix + command} -list* para ver los efectos. ♪`);
      }

      const db = global.db.data.users[m.sender] || {};
      const name = db.name || 'Espectador';
      const meta1 = db.metadatos ? String(db.metadatos).trim() : '';
      const meta2 = db.metadatos2 ? String(db.metadatos2).trim() : '';
      
      let pack = meta1 || `📻 𝖱𝖺𝖽𝗂𝗈 𝖣𝖾𝗆𝗈𝗇 𝖲𝗍𝗂𝖼𝗄𝖾𝗋𝗌`;
      let author = meta2 || `🎙️ 𝖠𝗅𝖺𝗌𝗍𝗈 r - ${name}`;

      if (args) {
        let filteredText = args.join(' ').replace(/-\w+/g, '').trim();
        let marca = filteredText.split(/[|]/).map(part => part.trim());
        if (marca[0]) pack = marca[0];
        if (marca[1]) author = marca[1];
      }

      const shapeArgs = { '-c': 'circle', '-t': 'triangle', '-r': 'roundrect', '-v': 'heart' };
      const effectArgs = { '-blur': 'blur', '-sepia': 'sepia', '-grayscale': 'grayscale', '-invert': 'invert' };
      
      const effects = [];
      if (args) {
        for (const arg of args) {
          if (shapeArgs[arg]) effects.push({ type: 'shape', value: shapeArgs[arg] });
          else if (effectArgs[arg]) effects.push({ type: 'effect', value: effectArgs[arg] });
        }
      }

      // --- Descarga y Validación de Integridad ---
      let buffer = await quoted.download();
      if (!buffer || buffer.length < 100) {
        return m.reply('📻 *¡Interferencia!* Los datos del medio están corruptos o vacíos. ♪');
      }

      const ext = /video/.test(mime) ? 'mp4' : 'webp';
      const inputPath = path.join(tmpDir, `in-${Date.now()}.${ext}`);
      
      // Escritura sincrónica para asegurar que el archivo esté listo
      fs.writeFileSync(inputPath, buffer);

      if (!fs.existsSync(inputPath) || fs.statSync(inputPath).size === 0) {
        throw new Error("Fallo al escribir archivo temporal.");
      }

      // --- Procesamiento FFmpeg ---
      const processWithFFmpeg = async (pathIn) => {
        const pathOut = path.join(tmpDir, `out-${Date.now()}.webp`);
        const vf = buildFFmpegFilters(effects);
        
        const ffmpegArgs = [
          '-y',
          '-analyzeduration', '30M', 
          '-probesize', '30M',
          '-i', pathIn, 
          '-vf', vf, 
          '-loop', '0', 
          '-pix_fmt', 'yuva420p',
          '-c:v', 'libwebp', 
          '-q:v', '70',
          '-preset', 'default',
          '-an', 
          '-fps_mode', 'passthrough',
          pathOut
        ];
        
        return new Promise((resolve, reject) => {
          const p = spawn('ffmpeg', ffmpegArgs);
          let errLog = '';
          p.stderr.on('data', (d) => errLog += d.toString());
          p.on('close', (code) => {
            if (code === 0 && fs.existsSync(pathOut)) {
              const data = fs.readFileSync(pathOut);
              fs.unlinkSync(pathOut);
              resolve(data);
            } else {
              reject(new Error(errLog.slice(-150) || 'Error en la conversión'));
            }
          });
        });
      };

      const webpBuffer = await processWithFFmpeg(inputPath);
      const stickerPath = await writeExif({ mimetype: 'image/webp', data: webpBuffer }, { packname: pack, author: author });
      
      await client.sendMessage(m.chat, { sticker: { url: stickerPath } }, { quoted: m });
      
      // Limpieza final
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(stickerPath)) fs.unlinkSync(stickerPath);

    } catch (e) {
      console.error('STICKER ERROR:', e);
      const msg = e.message || "Fallo en la señal";
      await m.reply(`📻 *¡CRASH!* La estática nos invade... \n> [Error: *${msg.trim()}*]`);
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
    if (e.value === 'invert') filters.push('negate');
  }

  const shape = effects.find(e => e.type === 'shape')?.value;
  if (shape === 'circle') filters.push(`geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(lte((X-256)*(X-256)+(Y-256)*(Y-256),256*256),255,0)'`);
  if (shape === 'roundrect') filters.push(`geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(and(lte(abs(X-256),225),lte(abs(Y-256),225)),255,0)'`);

  return filters.join(',');
};
