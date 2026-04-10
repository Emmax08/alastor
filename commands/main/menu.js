import fetch from 'node-fetch';
import { getDevice } from '@whiskeysockets/baileys';
import fs from 'fs';
import axios from 'axios';
import moment from 'moment-timezone';
import { bodyMenu, menuObject } from '../../lib/commands.js';

// Caracter invisible para el "Leer más"
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
      
      // Configuración de Estilo
      const botname = botSettings.botname || 'Radio Demon Bot';
      const canalId = botSettings.id || '120363401893800327@newsletter';
      const canalName = botSettings.nameid || 'Canal de Transmisión 🎙️';
      const videoBanner = 'https://files.catbox.moe/bshei1.mp4'; // El video que pediste

      // Datos de sesión y stats
      const tempo = moment.tz('America/Mexico_City').format('hh:mm A');
      const tiempo = moment.tz('America/Mexico_City').format('DD/MM/YYYY');
      const users = Object.keys(global.db.data.users).length;
      const senderName = global.db.data.users[m.sender]?.name || 'Espectador Anónimo';
      const uptime = client.uptime ? formatearMs(Date.now() - client.uptime) : "00:00:00";

      // Definición de Categorías y Alias (Inspirado en tu segundo código)
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
      // Buscar si el argumento coincide con alguna categoría o sus tags
      const selectedCatKey = Object.keys(CATEGORIES).find(k => 
        k === input || CATEGORIES[k].tags.map(normalize).includes(input)
      );

      // --- LÓGICA DE SUB-MENÚ (Si el usuario pidió una categoría) ---
      if (selectedCatKey) {
        const catData = CATEGORIES[selectedCatKey];
        const comandos = menuObject[selectedCatKey] || '╰➤ Próximamente... ♪';

        const subMenuTexto = [
          `*╭┈┈┈┈┈┈┈┈┈୨୧┈┈┈┈┈┈┈┈┈╮*`,
          `*│* ${catData.emoji} *${selectedCatKey.toUpperCase()}*`,
          `*╰┈┈┈┈┈┈┈┈┈୨୧┈┈┈┈┈┈┈┈┈╯*`,
          `*🎙️ Sintonizando frecuencia...*`,
          ``,
          comandos,
          ``,
          `*╭┈┈┈┈┈┈┈┈┈୨୧┈┈┈┈┈┈┈┈┈╮*`,
          `*│* 💡 Escribe *${usedPrefix}menu* para volver`,
          `*╰┈┈┈┈┈┈┈┈┈୨୧┈┈┈┈┈┈┈┈┈╯*`,
          `*¡Sonríe! El show no termina.* ♪`
        ].join('\n');

        return await client.sendMessage(idChat, {
          video: { url: videoBanner },
          gifPlayback: true,
          caption: subMenuTexto,
          contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: m });
      }

      // --- LÓGICA DE MENÚ PRINCIPAL (Si no hay argumentos) ---
      const encabezado = [
        `*╭┈┈┈┈┈┈┈┈┈୨୧┈┈┈┈┈┈┈┈┈╮*`,
        `*│ 📻 | 𝗠𝗔𝗥𝗜𝗔 𝗞𝗨𝗝𝗢𝗨 𝗫 𝗔𝗟𝗔𝗦𝗧𝗢𝗥 | 🎙️*`,
        `*╰┈┈┈┈┈┈┈┈┈୨୧┈┈┈┈┈┈┈┈┈╯*`,
        `⎔ \`${tiempo} | ${tempo}\``,
        `*├┈──────────────────────┈*`,
        `*│ 📊 I N F O R M A C I Ó N*`,
        `*│* ⏱️ *Uptime:* ${uptime}`,
        `*│* 👥 *Almas:* ${users.toLocaleString()}`,
        `*│* 👤 *Oyente:* ${senderName}`,
        `*│* 🤖 *Bot:* ${botname}`,
        `*╰┈┈┈┈┈┈┈┈┈୨୧┈┈┈┈┈┈┈┈┈╯*`,
        `\n🎙️ *SECCIONES DISPONIBLES:*`
      ].join('\n');

      const listaCategorias = Object.entries(CATEGORIES)
        .map(([name, data], i) => {
          return `*│* ${String(i + 1).padStart(2, '0')}. ${data.emoji} *${name.toUpperCase()}*\n*│* ╰➤ \`${usedPrefix}menu ${name}\``;
        })
        .join('\n');

      const menuFinal = [
        encabezado,
        listaCategorias,
        `*╰┈┈┈┈┈┈┈┈┈୨୧┈┈┈┈┈┈┈┈┈╯*`,
        `\n> 💡 Selecciona una frecuencia escribiendo el nombre de la categoría.`,
        readMore,
        `*¡El mundo es un escenario! Y el escenario es un mundo de entretenimiento.* ♪`
      ].join('\n');

      await client.sendMessage(idChat, {
        video: { url: videoBanner },
        gifPlayback: true,
        caption: menuFinal,
        contextInfo: {
          mentionedJid: [m.sender],
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: canalId,
            newsletterName: canalName,
            serverMessageId: -1
          },
          externalAdReply: {
            title: `📻 Transmisión en Vivo: ${botname}`,
            body: `Sintonizando: ${senderName}`,
            thumbnailUrl: 'https://files.catbox.moe/bshei1.mp4', // Puedes cambiar esto por una imagen fija si prefieres
            mediaType: 1,
            renderLargerThumbnail: false
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
