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
 * Función de respaldo usando API externa (XTeam o similar)
 * Esta función no depende del FFmpeg de tu servidor.
 */
async function stickerAPI(img, url, packname, author) {
  try {
    // Si no hay URL, subimos el archivo primero para que la API pueda leerlo
    url = url ? url : await uploadFile(img)
    
    // Usamos una API confiable de conversión (ajusta la URL si tienes una propia)
    let res = await fetch(`https://api.xteam.xyz/sticker/wm?${new URLSearchParams({
      url,
      packname,
      author
    })}`)
    
    if (!res.ok) throw new Error('Error en la API externa')
    return await res.buffer()
  } catch (e) {
    console.error('API Error:', e)
    return null
  }
}

/**
 * addExif se mantiene para inyectar tus metadatos personalizados
 */
async function addExif(webpSticker, packname, author, categories = [''], extra = {}) {
  const img = new webp.Image();
  const stickerPackId = crypto.randomBytes(32).toString('hex');
  const json = { 
    'sticker-pack-id': stickerPackId, 
    'sticker-pack-name': packname, 
    'sticker-pack-publisher': author, 
    'emojis': categories, 
    ...extra 
  };
  let exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
  let jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
  let exif = Buffer.concat([exifAttr, jsonBuffer]);
  exif.writeUIntLE(jsonBuffer.length, 14, 4);
  await img.load(webpSticker)
  img.exif = exif
  return await img.save(null)
}

/**
 * FUNCIÓN PRINCIPAL REESTRUCTURADA
 * Prioriza APIs externas para evitar el error de FFmpeg en el host.
 */
async function sticker(img, url, ...args) {
  let lastError, stiker
  
  // Lista de funciones de conversión en orden de prioridad
  // Ponemos stickerAPI (que es sticker3 mejorado) al principio
  for (let func of [
    stickerAPI, // 1. Intentar vía API externa (Salva el error de FFmpeg)
    sticker5,   // 2. Intentar vía wa-sticker-formatter (si está instalado)
    sticker6    // 3. Intento local (último recurso)
  ].filter(f => f)) {
    try {
      stiker = await func(img, url, ...args)
      if (!stiker || stiker.includes('html')) continue
      
      if (stiker.includes('WEBP')) {
        try {
          return await addExif(stiker, ...args)
        } catch (e) {
          return stiker
        }
      }
    } catch (err) {
      lastError = err
      continue
    }
  }
  return lastError
}

// ... Mantener sticker1, sticker2, sticker4, sticker5 y sticker6 igual ...

export {
  sticker,
  addExif,
  support
}
