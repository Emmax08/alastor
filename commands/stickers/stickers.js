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
 * Función sticker MODIFICADA para forzar metadatos personalizados.
 * Esta versión ignora los valores predeterminados del bot si el usuario tiene los suyos.
 */
async function sticker(img, url, packname, author, ...args) {
    let lastError, stiker

    // === INICIO DE LA MODIFICACIÓN PARA METADATOS ESTRICTOS ===
    const m = args[0]?.m; // Intentamos obtener el mensaje para sacar el sender
    const db = global.db.data;

    // Si el mensaje (m) está disponible y el usuario existe en la base de datos
    if (m && db.users[m.sender]) {
        const userMeta = db.users[m.sender];

        // PRIORIDAD 1: Usar solo lo que el usuario configuró.
        // Si no hay nada configurado, usar una cadena vacía ('') para que no salga nada.
        packname = userMeta.metadatos !== undefined ? userMeta.metadatos : ''; 
        author = userMeta.metadatos2 !== undefined ? userMeta.metadatos2 : '';

        // Con esto forzamos que NUNCA se usen global.packname o global.author
        // si el usuario ha configurado algo, incluso si es una cadena vacía.
    } else {
        // PRIORIDAD 2: Si por alguna razón no se puede determinar el usuario,
        // usar valores por defecto del bot, pero idealmente vacíos.
        packname = packname || '';
        author = author || '';
    }
    // === FIN DE LA MODIFICACIÓN PARA METADATOS ESTRICTOS ===

    for (let func of [
        sticker3, support.ffmpeg && sticker6, sticker5,
        support.ffmpeg && support.ffmpegWebp && sticker4,
        support.ffmpeg && (support.convert || support.magick || support.gm) && sticker2,
        sticker1
    ].filter(f => f)) {
        try {
            stiker = await func(img, url, packname, author, ...args)
            if (stiker.includes('html')) continue
            if (stiker.includes('WEBP')) {
                try {
                    // addExif añadirá los metadatos correctos (o vacíos)
                    return await addExif(stiker, packname, author, ...args)
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

// ... (El resto de las funciones: sticker1, sticker2, sticker3, sticker4, sticker5, sticker6, canvas, queryURL, addExif, support siguen IGUAL que en tu código original)
// ...

function sticker2(img, url) {
    // ... (sin cambios)
}

// ... (todas las demás funciones permanecen sin cambios)

export {
    sticker,
    sticker1,
    sticker2,
    sticker3,
    sticker4,
    sticker6,
    addExif,
    support
}
