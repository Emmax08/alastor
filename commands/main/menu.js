import fetch from 'node-fetch';
import { getDevice } from '@whiskeysockets/baileys';
import fs from 'fs';
import axios from 'axios';
import moment from 'moment-timezone';
import { bodyMenu, menuObject } from '../../lib/commands.js';

const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);

function normalize(text = '') {
  text = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
  return text.endsWith('s') ? text.slice(0, -1) : text;
}

export default {
  command: ['allmenu', 'help', 'menu'],
  category: 'info',
  run: async (client, m, args, usedPrefix, command) => {
    try {
      const idChat = m.chat;
      const botId = client?.user?.id.split(':')[0] + '@s.whatsapp.net';
      const botSettings = global.db.data.settings[botId] || {};
      
      const botname = botSettings.botname || 'Radio Demon Bot';
      const canalId = botSettings.id || '120363401893800327@newsletter';
      const canalName = botSettings.nameid || 'Canal de Transmisión 🎙️';
      const videoBanner = 'https://files.catbox.moe/bshei1.mp4'; 

      const tempo = moment.tz('America/Mexico_City').format('hh:mm A');
      const tiempo = moment.tz('America/Mexico_City').format('DD/MM/YYYY');
      const users = Object.keys(global.db.data.users).length;
      const senderName = global.db.data.users[m.sender]?.name || 'Espectador Anónimo';
      const uptime = client.uptime ? formatearMs(Date.now() - client.uptime) : "00:00:00";

      const CATEGORIES = {
        'anime': { emoji: '✨', tags: ['anime', 'reacciones', 'otaku'] },
        'downloads': { emoji: '⬇️', tags: ['downloads', 'descargas', 'archivos'] },
        'economia': { emoji: '💰', tags: ['economia', 'economy', 'banco'] },
        'gacha': { emoji: '🕹️', tags: ['gacha', 'rpg', 'suerte'] },
        'grupo': { emoji: '👥', tags: ['grupo', 'group', 'admin'] },
        'nsfw': { emoji: '🔞', tags: ['nsfw', '+18', 'pecados'] },
        'profile': { emoji: '👤', tags: ['profile', 'perfil', 'usuario'] },
        'stickers': { emoji: '🎨', tags: ['stickers', 'sticker', 'estampados'] },
        'utils': { emoji: '🛠️', tags: ['utils', 'utilidades', 'herramientas'] }
      };

      const input = normalize(args[0] || '');
      const selectedCatKey = Object.keys(CATEGORIES).find(k => 
        k === input || CATEGORIES[k].tags.map(normalize).includes(input)
      );

      // --- PROCESAMIENTO DE TEXTO ---
      // Esta función reemplaza los placeholders ($sender, $prefix, etc) por datos reales
      const replacePlaceholders = (text, catLabel = '') => {
        return text
          .replace(/\$sender/g, senderName)
          .replace(/\$namebot/g, botname)
          .replace(/\$owner/g, botSettings.owner || 'Emmax')
          .replace(/\$botType/g, (botId === global.client.user.id.split(':')[0] + '@s.whatsapp.net' ? 'Principal' : 'Sub-Bot'))
          .replace(/\$device/g, getDevice(m.key.id))
          .replace(/\$tiempo/g, tiempo)
          .replace(/\$tempo/g, tempo)
          .replace(/\$users/g, users.toLocaleString())
          .replace(/\$cat/g, catLabel)
          .replace(/\$prefix/g, usedPrefix); // AQUÍ SE PONE EL PREFIJO REAL
      };

      if (selectedCatKey) {
        const catData = CATEGORIES[selectedCatKey];
        let content = menuObject[selectedCatKey] || '╰➤ Próximamente... ♪';
        
        // Aplicamos el reemplazo de $prefix a los comandos de la categoría
        const textoFinal = replacePlaceholders(content);

        return await client.sendMessage(idChat, {
          video: { url: videoBanner },
          gifPlayback: true,
          caption: textoFinal,
          contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: m });
      }

      // --- MENÚ PRINCIPAL ---
      const listaCategorias = Object.entries(CATEGORIES)
        .map(([name, data], i) => {
          return `*│* ${String(i + 1).padStart(2, '0')}. ${data.emoji} *${name.toUpperCase()}*\n*│* ╰➤ \`${usedPrefix}menu ${name}\``;
        })
        .join('\n');

      let menuPrincipal = replacePlaceholders(bodyMenu, '. ♪');
      
      const fullMenu = [
        menuPrincipal,
        `🎙️ *SECCIONES DISPONIBLES:*`,
        listaCategorias,
        `*╰┈┈┈┈┈┈┈┈┈୨୧┈┈┈┈┈┈┈┈┈╯*`,
        `\n> 💡 Selecciona una frecuencia escribiendo el comando de la categoría.`,
        readMore,
        `*¡El mundo es un escenario! Y el escenario es un mundo de entretenimiento.* ♪`
      ].join('\n');

      await client.sendMessage(idChat, {
        video: { url: videoBanner },
        gifPlayback: true,
        caption: fullMenu,
        contextInfo: {
          mentionedJid: [m.sender],
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: canalId,
            newsletterName: canalName,
            serverMessageId: -1
          }
        }
      }, { quoted: m });

    } catch (e) {
      console.error(e);
      await m.reply(`📻 *¡CRASH!* La estática nos invade...\n> [Error: ${e.message}]`);
    }
  }
};

function formatearMs(ms) {
  const segundos = Math.floor(ms / 1000);
  const minutos = Math.floor(segundos / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);
  return [dias && `${dias}d`, `${horas % 24}h`, `${minutos % 60}m`, `${segundos % 60}s`].filter(Boolean).join(" ");
}
