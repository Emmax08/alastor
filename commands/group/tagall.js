export default {
  command: ['todos', 'invocar', 'tagall'],
  category: 'grupo',
  isAdmin: true,
  run: async (client, m, args) => {
    const groupInfo = await client.groupMetadata(m.chat)
    const participants = groupInfo.participants
    const pesan = args.join(' ')
    let teks = `﹒⌗﹒📻 .ৎ˚₊‧  ${pesan || 'Invocacion 🀄️'}\n\n𐚁 ֹ ִ \`INFIERNO INVOCATION \` ! ୧ ֹ ִ🕸️\n\n🔪 \`Miembros :\` ${participants.length}\n☸️ \`Invocador :\` @${m.sender.split('@')[0]}\n\n` +
      `╭┄ ꒰ \`Lista de pecadores:ׄ\` ꒱ ┄\n`
    for (const mem of participants) {
      teks += `┊ꕥ @${mem.id.split('@')[0]}\n`
    }
    teks += `╰⸼ ┄ ┄ ꒰ \`${version}\` ꒱ ┄ ┄⸼`
    return client.reply(m.chat, teks, m, { mentions: [m.sender, ...participants.map(p => p.id)] })
  }
}