import fetch from 'node-fetch';
import { getDevice } from '@whiskeysockets/baileys';
import fs from 'fs';
import axios from 'axios';
import moment from 'moment-timezone';
import { bodyMenu, menuObject } from '../../lib/commands.js';

function normalize(text = '') {
  text = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
  return text.endsWith('s') ? text.slice(0, -1) : text;
}

export default {
  command: ['allmenu', 'help', 'menu'],
  category: 'info',
  run: async (client, m, { args, usedPrefix, command }) => {
    try {
      const now = new Date();
      // Ajustado a la zona horaria que prefieras, mantuve la lógica original con un toque de elegancia
      const tempo = moment.tz('America/Mexico_City').format('hh:mm A');
      const tiempo = moment.tz('America/Mexico_City').format('DD[/]MM[/]YYYY');
      
      const botId = client?.user?.id.split(':')[0] + '@s.whatsapp.net';
      const botSettings = global.db.data.settings[botId] || {};
      const botname = botSettings.botname || 'Radio Demon Bot';
      const namebot = botSettings.namebot || 'Alastor Personalization';
      const banner = botSettings.banner || '';
      const owner = botSettings.owner || '';
      const canalId = botSettings.id || '';
      const canalName = botSettings.nameid || 'Canal de Transmisión';
      const isOficialBot = botId === global.client.user.id.split(':')[0] + '@s.whatsapp.net';
      const botType = isOficialBot ? 'Emisora Principal' : 'Repetidora Estelar';
      
      const users = Object.keys(global.db.data.users).length;
      const device = getDevice(m.key.id);
      const sender = global.db.data.users[m.sender]?.name || 'Espectador Anónimo';
      const time = client.uptime ? formatearMs(Date.now() - client.uptime) : "Desconocido";

      const alias = {
        anime: ['anime', 'reacciones', 'otaku'],
        downloads: ['downloads', 'descargas', 'archivos'],
        economia: ['economia', 'economy', 'banco'],
        gacha: ['gacha', 'rpg', 'suerte'],
        grupo: ['grupo', 'group', 'administracion'],
        nsfw: ['nsfw', '+18', 'pecados'],
        profile: ['profile', 'perfil', 'usuario'],
        sockets: ['sockets', 'bots', 'clones'],
        stickers: ['stickers', 'sticker', 'estampados'],
        utils: ['utils', 'utilidades', 'herramientas']
      };

      const input = normalize(args[0] || '');
      const cat = Object.keys(alias).find(k => alias[k].map(normalize).includes(input));
      const categoryLabel = cat ? ` para la sección *${cat.toUpperCase()}*` : '. ♪';

      if (args[0] && !cat) {      
        return m.reply(`📻 *¡Vaya interferencia!* La categoría *${args[0]}* no existe en mi sintonizador.\n\n🎙️ *Categorías disponibles:* \n> ${Object.keys(alias).join(', ')}\n\n*¡El espectáculo debe continuar!*`);
      }

      const sections = menuObject;
      const content = cat ? String(sections[cat] || '') : Object.values(sections).map(s => String(s || '')).join('\n\n');
      
      // Construcción del cuerpo del menú con el carisma de Alastor
      let menu = bodyMenu ? String(bodyMenu || '') + '\n\n' + content : content;
      
      const replacements = {
        $owner: owner ? (!isNaN(owner.replace(/@s\.whatsapp\.net$/, '')) ? global.db.data.users[owner]?.name || owner.split('@')[0] : owner) : 'Un caballero no revela sus secretos',
        $botType: botType,
        $device: device,
        $tiempo: tiempo,
        $tempo: tempo,
        $users: users.toLocaleString(),
        $cat: categoryLabel,
        $sender: sender,
        $botname: botname,
        $namebot: namebot,
        $prefix: usedPrefix,
        $uptime: time
      };

      for (const [key, value] of Object.entries(replacements)) {
        menu = menu.replace(new RegExp(`\\${key}`, 'g'), value);
      }

      const radioCaption = `📻 🎙️  *𝗣𝗥𝗢𝗚𝗥𝗔𝗠𝗔𝗖𝗜𝗢𝗡 𝗗𝗘 𝗟𝗔 𝗥𝗔𝗗𝗜𝗢* 🎙️ 📻\n\n` +
                           `¡Saludos, *${sender}*! Es un placer tenerte en nuestra frecuencia.\n\n` +
                           menu + 
                           `\n\n*¡Sonríe! El mundo nunca está completo sin una sonrisa.* ♪`;

      await client.sendMessage(m.chat, banner.includes('.mp4') || banner.includes('.webm') ? {
          video: { url: banner },
          gifPlayback: true,
          caption: radioCaption,
          contextInfo: {
            mentionedJid: [m.sender],
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: canalId,
              serverMessageId: '',
              newsletterName: canalName
            }
          }
        } : {
          text: radioCaption,
          contextInfo: {
            mentionedJid: [m.sender],
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: canalId,
              serverMessageId: '',
              newsletterName: canalName
            },
            externalAdReply: {
              title: `📻 ${botname} - Frecuencia del Infierno`,
              body: `Transmitiendo para: ${sender}`,
              showAdAttribution: false,
              thumbnailUrl: banner,
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        }, { quoted: m });

    } catch (e) {
      await m.reply(`📻 *¡CRASH!* La estática nos invade... \n> [Error de sintonía: *${e.message}*]\n¡El show debe continuar! ♪`);
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
