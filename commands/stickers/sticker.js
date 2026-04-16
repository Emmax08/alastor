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
    try {
      if (args && args[0] === '-list') {
        let helpText = `📻 🎙️ *𝗖𝗔𝗧𝗔𝗟𝗢𝗚𝗢 𝗗𝗘 𝗘𝗦𝗧𝗔𝗠𝗣𝗔𝗗𝗢𝗦* 🎙️ 📻\n\n` +
          `🎭 *𝗙𝗼𝗿𝗺𝗮𝘀 𝗗𝗶𝘀𝗽𝗼𝗻𝗶𝗯𝗹𝗲𝘀:*\n` +
          `➔ *-c* : Círculo de la Radio\n` +
          `➔ *-t* : Triángulo del Destino\n` +
          `➔ *-r* : Esquinas Suaves\n` +
          `➔ *-v* : Corazón de Pecador\n` +
          `➔ *-m* : Espejo del Alma\n\n` +
          `🎞️ *𝗘𝗳𝗲𝗰𝘁𝗼𝘀 𝗩𝗶𝘀𝘂𝗮𝗹𝗲𝘀:*\n` +
          `➔ *-blur* : Estática de Radio\n` +
          `➔ *-sepia* : Crónica de 1930\n` +
          `➔ *-grayscale* : TV Blanco y Negro\n` +
          `➔ *-invert* : El Lado Oscuro\n\n` +
          `🎙️ *Ejemplo:* _${usedPrefix + command} -c -sepia Pack | Alastor_\n\n` +
          `*¡Sonríe, el mundo te está observando!*`;
        return m.reply(helpText);
      }

      const quoted = m.quoted ? m.quoted : m;
      const mime = (quoted.msg || quoted).mimetype || '';
      
      const db = global.db.data.users[m.sender] || {};
      const name = db.name || 'Espectador';
      const meta1 = db.metadatos ? String(db.metadatos).trim() : '';
      const meta2 = db.metadatos2 ? String(db.metadatos2).trim() : '';
      
      let textoDefault1 = meta1 ? meta1 : `📻 𝖱𝖺𝖽𝗂𝗈 𝖣𝖾𝗆𝗈𝗇 𝖲𝗍𝗂𝖼𝗄𝖾𝗋𝗌`;
      let textoDefault2 = meta2 ? meta2 : `🎙️ 𝖠𝗅𝖺𝗌𝗍𝗈𝗋 - ${name}`;

      let urlArg = null;
      let argsWithoutUrl = [];
      if (args) {
        for (let arg of args) {
          if (isUrl(arg)) urlArg = arg;
          else argsWithoutUrl.push(arg);
        }
      }

      let filteredText = argsWithoutUrl.join(' ').replace(/-\w+/g, '').trim();
      let marca = filteredText.split(/[|]/).map(part => part.trim());
      let pack = marca[0] || textoDefault1;
      let author = marca.length > 1 ? marca[1] : textoDefault2;

      const shapeArgs = { '-c': 'circle', '-t': 'triangle', '-r': 'roundrect', '-v': 'heart', '-m': 'mirror' };
      const effectArgs = { '-blur': 'blur', '-sepia': 'sepia', '-grayscale': 'grayscale', '-invert': 'invert' };
      
      const effects = [];
      for (const arg of argsWithoutUrl) {
        if (shapeArgs[arg]) effects.push({ type: 'shape', value: shapeArgs[arg] });
        else if (effectArgs[arg]) effects.push({ type: 'effect', value: effectArgs[arg] });
      }

      const sendWebpWithExif = async (webpBuffer) => {
        const media = { mimetype: 'image/webp', data: webpBuffer };
        const metadata = { packname: pack, author: author };
        const stickerPath = await writeExif(media, metadata);
        await client.sendMessage(m.chat, { sticker: { url: stickerPath } }, { quoted: m });
        if (fs.existsSync(stickerPath)) fs.unlinkSync(stickerPath);
      };

      const processWithFFmpeg = async (inputPath) => {
        const outputPath = `./tmp/sticker-${Date.now()}.webp`;
        const vf = buildFFmpegFilters(effects);
        
        // --- CONFIGURACIÓN REPARADA PARA DEBIAN 12 / FFmpeg 5.1+ ---
        let ffmpegArgs = [
          '-y',
          '-flags', 'low_delay',
          '-analyzeduration', '15M',
          '-probesize', '15M',
          '-i', inputPath, 
          '-vf', vf, 
          '-loop', '0', 
          '-pix_fmt', 'yuva420p',
          '-c:v', 'libwebp', 
          '-lossless', '0', 
          '-q:v', '75',
          '-preset', 'default', 
          '-an', 
          '-fps_mode', 'passthrough', // Reemplazo de -vsync
          outputPath
        ];
        
        await new Promise((resolve, reject) => {
          const p = spawn('ffmpeg', ffmpegArgs);
          let err = '';
          p.stderr.on('data', (d) => err += d.toString());
          p.on('close', (code) => { 
            if (code === 0) resolve(); 
            else reject(new Error(err)); 
          });
        });

        const data = fs.readFileSync(outputPath);
        fs.unlinkSync(outputPath);
        await sendWebpWithExif(data);
      };

      if (/image|webp/.test(mime)) {
        let buffer = await quoted.download();
        const inputPath = `./tmp/in-${Date.now()}.webp`;
        fs.writeFileSync(inputPath, buffer);
        await processWithFFmpeg(inputPath);
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        
      } else if (/video/.test(mime)) {
        if ((quoted.msg || quoted).seconds > 10) return m.reply('📻 *¡Demasiado largo!* El show debe ser breve. ♪');
        let buffer = await quoted.download();
        const inputPath = `./tmp/video-${Date.now()}.mp4`;
        fs.writeFileSync(inputPath, buffer);
        await processWithFFmpeg(inputPath);
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        
      } else if (urlArg) {
        const response = await fetch(urlArg);
        const buffer = Buffer.from(await response.arrayBuffer());
        const inputPath = `./tmp/url-${Date.now()}.img`;
        fs.writeFileSync(inputPath, buffer);
        await processWithFFmpeg(inputPath);
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        
      } else {
        return m.reply(`🎙️ *¡Sintonizando!* Responde a una imagen o video.\n> Usa *${usedPrefix + command} -list* para ver los efectos. ♪`);
      }

    } catch (e) {
      console.error(e);
      await m.reply(`📻 *¡CRASH!* La estática nos invade... \n> [Error: *${e.message.split('\n').pop()}*]\n¡No te preocupes, el espectáculo debe continuar! ♪`);
    }
  }
};

const isUrl = (text) => text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/, 'gi'));

const buildFFmpegFilters = (effects) => {
  const W = 512, H = 512;
  const filters = [];
  const shape = effects.find(e => e.type === 'shape')?.value;
  const effectList = effects.filter(e => e.type === 'effect').map(e => e.value);
  
  // Normalización de escala y formato RGBA para evitar errores de decodificación
  filters.push(`scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=0x00000000,format=rgba`);

  for (const effect of effectList) {
    if (effect === 'sepia') filters.push('colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131');
    if (effect === 'blur') filters.push('gblur=sigma=3');
    if (effect === 'grayscale') filters.push('hue=s=0');
    if (effect === 'invert') filters.push('negate');
  }

  if (shape === 'circle') {
    filters.push(`geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(lte((X-256)*(X-256)+(Y-256)*(Y-256),256*256),255,0)'`);
  } else if (shape === 'roundrect') {
    filters.push(`geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(and(lte(abs(X-256),230),lte(abs(Y-256),230)),255,0)'`);
  }
  
  return filters.join(',');
};
