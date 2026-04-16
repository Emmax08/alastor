import { dirname } from 'path'
import { fileURLToPath } from 'url'
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { ffmpeg } from './converter.js'
import fluent_ffmpeg from 'fluent-ffmpeg'
import { spawn } from 'child_process'
import uploadFile from './uploadFile.js'
import uploadImage from './uploadImage.js'
import { fileTypeFromBuffer } from 'file-type'
import webp from 'node-webpmux'
import fetch from 'node-fetch'

const __dirname = dirname(fileURLToPath(import.meta.url))
const tmp = path.join(__dirname, '../tmp')

/**
 * Lógica de filtros personalizada (Alastor Theme)
 * @param {Array} effectsList - Lista de efectos (shape, sepia, etc)
 */
const buildFFmpegFilters = (effectsList = []) => {
  const W = 320, H = 320; // Tamaño estándar de sticker6
  let filters = [`scale='min(${W},iw)':min'(${H},ih)':force_original_aspect_ratio=decrease,fps=15,pad=${W}:${H}:-1:-1:color=white@0.0`]

  for (const e of effectsList) {
    if (e === 'sepia') filters.push('colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131')
    if (e === 'blur') filters.push('gblur=sigma=2')
    if (e === 'grayscale') filters.push('hue=s=0')
    if (e === 'invert') filters.push('negate')
  }

  // Formas (Alpha masks)
  if (effectsList.includes('circle')) {
    filters.push(`geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(lte((X-160)*(X-160)+(Y-160)*(Y-160),160*160),255,0)'`)
  } else if (effectsList.includes('roundrect')) {
    filters.push(`geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(and(lte(abs(X-160),140),lte(abs(Y-160),140)),255,0)'`)
  }

  return filters.join(',')
}

// ... sticker1, sticker2, sticker3, sticker4, sticker5 se mantienen igual ...

/**
 * sticker6 modificado para soportar tus efectos personalizados
 */
function sticker6(img, url, packname, author, categories, extra = {}) {
  return new Promise(async (resolve, reject) => {
    if (url) {
      let res = await fetch(url)
      if (res.status !== 200) throw await res.text()
      img = await res.buffer()
    }
    const type = await fileTypeFromBuffer(img) || { mime: 'application/octet-stream', ext: 'bin' }
    if (type.ext == 'bin') reject(img)

    const input = path.join(tmp, `${+ new Date()}.${type.ext}`)
    const out = path.join(input + '.webp')
    await fs.promises.writeFile(input, img)

    // Extraemos efectos de 'extra' si existen
    const customFilters = buildFFmpegFilters(extra.effects || [])

    let Fffmpeg = /video/i.test(type.mime) ? fluent_ffmpeg(input).inputFormat(type.ext) : fluent_ffmpeg(input).input(input)
    
    Fffmpeg
      .on('error', function (err) {
        console.error(err)
        if (fs.existsSync(input)) fs.promises.unlink(input)
        reject(img)
      })
      .on('end', async function () {
        if (fs.existsSync(input)) fs.promises.unlink(input)
        resolve(await fs.promises.readFile(out))
        if (fs.existsSync(out)) fs.promises.unlink(out)
      })
      .addOutputOptions([
        `-vcodec`, `libwebp`,
        `-vf`, customFilters + `,split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`
      ])
      .toFormat('webp')
      .save(out)
  })
}

async function addExif(webpSticker, packname, author, categories = [''], extra = {}) {
  const img = new webp.Image();
  const stickerPackId = crypto.randomBytes(32).toString('hex');
  const json = { 'sticker-pack-id': stickerPackId, 'sticker-pack-name': packname, 'sticker-pack-publisher': author, "android-app-store-link": "https://play.google.com/store/apps/details?id=com.marsvard.stickermakerforwhatsapp", "ios-app-store-link": "https://itunes.apple.com/app/sticker-maker-studio/id1443326857", 'emojis': categories, ...extra };
  let exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
  let jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
  let exif = Buffer.concat([exifAttr, jsonBuffer]);
  exif.writeUIntLE(jsonBuffer.length, 14, 4);
  await img.load(webpSticker)
  img.exif = exif
  return await img.save(null)
}

async function sticker(img, url, ...args) {
  let lastError, stiker
  // args[3] suele ser el objeto 'extra' en este tipo de repositorios
  for (let func of [
    sticker3, 
    global.support.ffmpeg && sticker6, // sticker6 ahora es más potente
    sticker5,
    global.support.ffmpeg && global.support.ffmpegWebp && sticker4,
    sticker1
  ].filter(f => f)) {
    try {
      stiker = await func(img, url, ...args)
      if (stiker.includes('html')) continue
      if (stiker.includes('WEBP')) {
        try {
          return await addExif(stiker, ...args)
        } catch (e) {
          console.error(e)
          return stiker
        }
      }
      throw stiker.toString()
    } catch (err) {
      lastError = err
      continue
    }
  }
  console.error(lastError)
  return lastError
}

// ... exportaciones y soporte se mantienen igual ...
export { sticker, sticker1, sticker6, addExif, support }
