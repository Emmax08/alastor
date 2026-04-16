import { dirname } from 'path'
import { fileURLToPath } from 'url'
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { Sticker, StickerTypes } from 'wa-sticker-formatter' // Asegúrate de tener esta dependencia
import webp from 'node-webpmux'
import fetch from 'node-fetch'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Función Maestra: Usa WA-Sticker-Formatter que es más estable en Hosting compartido
 */
async function sticker(img, url, packname, author, categories = [''], extra = {}) {
  try {
    let source = img
    if (url) {
      let res = await fetch(url)
      if (res.status !== 200) throw new Error('Fallo al obtener URL')
      source = await res.buffer()
    }

    // Configuración del sticker
    const stickerMetadata = {
      type: StickerTypes.FULL, // O StickerTypes.CROPPED
      pack: packname || 'Radio Demon Pack',
      author: author || 'Alastor',
      categories: categories || ['📻'],
      id: crypto.randomBytes(16).toString('hex'),
      quality: 70
    }

    const stiker = new Sticker(source, stickerMetadata)
    return await stiker.toBuffer()

  } catch (e) {
    console.error('ERROR CRÍTICO STICKER:', e)
    return null
  }
}

/**
 * Mantenemos addExif por si necesitas inyectar metadatos manualmente después
 */
async function addExif(webpSticker, packname, author, categories = [''], extra = {}) {
  try {
    const img = new webp.Image();
    const json = { 
      'sticker-pack-id': crypto.randomBytes(32).toString('hex'), 
      'sticker-pack-name': packname, 
      'sticker-pack-publisher': author, 
      'emojis': categories 
    };
    let exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
    let jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
    let exif = Buffer.concat([exifAttr, jsonBuffer]);
    exif.writeUIntLE(jsonBuffer.length, 14, 4);
    await img.load(webpSticker)
    img.exif = exif
    return await img.save(null)
  } catch {
    return webpSticker
  }
}

const support = {
  ffmpeg: true,
  ffprobe: true,
  ffmpegWebp: true,
  convert: true,
  magick: false,
  gm: false,
  find: false
}

export {
  sticker,
  addExif,
  support
}
