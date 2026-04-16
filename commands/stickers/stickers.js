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
 */
const buildFFmpegFilters = (effectsList = []) => {
  const W = 320, H = 320; 
  let filters = [`scale='min(${W},iw)':min'(${H},ih)':force_original_aspect_ratio=decrease,fps=15,pad=${W}:${H}:-1:-1:color=white@0.0,format=rgba`]

  for (const e of effectsList) {
    if (e === 'sepia') filters.push('colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131')
    if (e === 'blur') filters.push('gblur=sigma=2')
    if (e === 'grayscale') filters.push('hue=s=0')
    if (e === 'invert') filters.push('negate')
  }

  if (effectsList.includes('circle')) {
    filters.push(`geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(lte((X-160)*(X-160)+(Y-160)*(Y-160),160*160),255,0)'`)
  } else if (effectsList.includes('roundrect')) {
    filters.push(`geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(and(lte(abs(X-160),140),lte(abs(Y-160),140)),255,0)'`)
  }

  return filters.join(',')
}

// ... sticker1, sticker2, sticker3, sticker4, sticker5 se mantienen igual ...

/**
 * sticker6 con reparación de decodificador WebP para consolas Akirax/Pterodactyl
 */
function sticker6(img, url, packname, author, categories, extra = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      if (url) {
        let res = await fetch(url)
        if (res.status !== 200) throw await res.text()
        img = await res.buffer()
      }
      const type = await fileTypeFromBuffer(img) || { mime: 'application/octet-stream', ext: 'bin' }
      if (type.ext == 'bin') return reject(img)

      const input = path.join(tmp, `${+ new Date()}.${type.ext}`)
      const out = path.join(input + '.webp')
      await fs.promises.writeFile(input, img)

      const customFilters = buildFFmpegFilters(extra.effects || [])
      let Fffmpeg = fluent_ffmpeg()

      // --- REPARACIÓN TÉCNICA: Configuración de entrada ---
      if (/video/i.test(type.mime)) {
        Fffmpeg.input(input).inputFormat(type.ext)
      } else {
        // Forzamos decodificador y aumentamos buffer de análisis para WebP
        Fffmpeg.input(input).inputOptions([
          '-vcodec', 'libwebp',
          '-analyzeduration', '15000000',
          '-probesize', '15000000'
        ])
      }

      Fffmpeg
        .on('error', function (err) {
          console.error('FFMPEG ERROR:', err)
          if (fs.existsSync(input)) fs.promises.unlink(input)
          reject(img)
        })
        .on('end', async function () {
          if (fs.existsSync(input)) fs.promises.unlink(input)
          if (fs.existsSync(out)) {
            const result = await fs.promises.readFile(out)
            fs.promises.unlink(out)
            resolve(result)
          } else {
            reject(img)
          }
        })
        .addOutputOptions([
          '-vcodec', 'libwebp',
          '-vf', `${customFilters},split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`,
          '-lossless', '0',
          '-q:v', '75',
          '-loop', '0',
          '-preset', 'default',
          '-an',
          '-fps_mode', 'passthrough'
        ])
        .toFormat('webp')
        .save(out)
        
    } catch (e) {
      reject(e)
    }
  })
}

// ... addExif y sticker se mantienen con tu lógica ...

export { sticker, sticker1, sticker6, addExif, support }
