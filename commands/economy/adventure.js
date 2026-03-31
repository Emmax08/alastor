export default {
  command: ['adventure', 'aventura'],
  category: 'rpg',
  run: async (client, m, { args, usedPrefix, command }) => {
    const chat = global.db.data.chats[m.chat]
    const user = chat.users[m.sender]
    const botId = client.user.id.split(':')[0] + '@s.whatsapp.net'
    const currency = global.db.data.settings[botId].currency
    
    if (chat.adminonly || !chat.economy) {
        return m.reply(`📻 *¡Interferencia en la señal!* Los comandos de *Economía* están desactivados. ¡Qué falta de clase! Un administrador puede activarlos con: *${usedPrefix}economy on*`)
    }

    user.lastadventure ||= 0
    if (user.coins == null) user.coins = 0
    if (user.health == null) user.health = 100
    
    if (user.health < 5) {
        return m.reply(`📻 *¡Vaya, parece que te falta aliento!* Estás más muerto que un pecador en el Exterminio. ♪\n> Usa *"${usedPrefix}heal"* para recomponerte, querido.`)
    }

    const remainingTime = user.lastadventure - Date.now()
    if (remainingTime > 0) {
      return m.reply(`📻 *¡Paciencia, pecador!* Debes esperar *${msToTime(remainingTime)}* antes de que la siguiente masacre... ¡Digo, aventura! comience. ♪`)
    }

    const rand = Math.random()
    let cantidad = 0
    let salud = Math.floor(Math.random() * (20 - 10 + 1)) + 10
    let message

    if (rand < 0.4) {
      cantidad = Math.floor(Math.random() * (18000 - 14000 + 1)) + 14000
      user.coins += cantidad
      user.health -= salud
      const successMessages = [
        `📻 🎙️ *¡Espectacular!* Lograste humillar a **Lucifer** en un duelo de canciones. ¡Se retiró llorando con sus patitos! Ganaste *¥${cantidad.toLocaleString()} ${currency}*.`,
        `📻 🎙️ *¡Bravo!* Ayudaste a **Charlie** con su hotel y, por alguna razón, los pecadores agradecidos te dieron *¥${cantidad.toLocaleString()} ${currency}*.`,
        `📻 🎙️ *¡Un show sangriento!* Derrotaste a un grupo de **Exorcistas** durante la purga. Sus lanzas de oro valen *¥${cantidad.toLocaleString()} ${currency}*.`,
        `📻 🎙️ *¡Justicia poética!* Le diste una lección a **Adam** antes de que pudiera decir otra grosería. ¡El botín es de *¥${cantidad.toLocaleString()} ${currency}*!`,
        `📻 🎙️ *¡Qué delicia!* Lograste hackear el sistema de **Vox** y desviaste sus fondos publicitarios: *¥${cantidad.toLocaleString()} ${currency}*.`,
        `📻 🎙️ *¡Fuego y gloria!* Ayudaste a **Vaggie** a defender el hotel. El agradecimiento se traduce en *¥${cantidad.toLocaleString()} ${currency}*.`
      ]
      message = pickRandom(successMessages)
    } else if (rand < 0.7) {
      cantidad = Math.floor(Math.random() * (11000 - 9000 + 1)) + 9000
      const total = (user.coins || 0) + (user.bank || 0)
      
      if (total >= cantidad) {
        if (user.coins >= cantidad) {
          user.coins -= cantidad
        } else {
          const restante = cantidad - user.coins
          user.coins = 0
          user.bank -= restante
        }
      } else {
        cantidad = total
        user.coins = 0
        user.bank = 0
      }
      
      user.health -= salud
      if (user.health < 0) user.health = 0
      
      const failMessages = [
        `📻 🎙️ *¡Qué tragedia!* **Sir Pentious** te disparó con su rayo láser por accidente. Perdiste *¥${cantidad.toLocaleString()} ${currency}*. ¡Jajaja!`,
        `📻 🎙️ *¡Perdido en el vicio!* **Angel Dust** te convenció de ir de fiesta y despertaste sin un solo centavo: *¥${cantidad.toLocaleString()} ${currency}* menos.`,
        `📻 🎙️ *¡Mala suerte!* **Husk** te ganó en una partida de cartas. ¡Perdiste hasta el orgullo y *¥${cantidad.toLocaleString()} ${currency}*!`,
        `📻 🎙️ *¡Interferencia!* Los **Vees** rastrearon tu señal y te cobraron una "multa" de *¥${cantidad.toLocaleString()} ${currency}*.`,
        `📻 🎙️ *¡Cuidado!* Caíste en una de las trampas de **Valentino**. Tuviste que pagar *¥${cantidad.toLocaleString()} ${currency}* para escapar.`
      ]
      message = pickRandom(failMessages)
    } else {
      const neutralMessages = [
        `📻 🎙️ Fuiste a ver un show de Angel Dust... Fue entretenido, pero tu bolsillo sigue igual de vacío.`,
        `📻 🎙️ Escuchaste los sermones de Charlie sobre la redención. ¡Qué optimismo tan aburrido!`,
        `📻 🎙️ Te encontraste con **Niffty** limpiando. Intentó "limpiar" tus pecados, pero tú no tienes remedio. ♪`,
        `📻 🎙️ Caminaste por las calles del Infierno evitando a los tiburones mafiosos. Un día tranquilo.`,
        `📻 🎙️ Vox y yo tuvimos otra disputa en televisión. ¡El rating estuvo por las nubes! No ganaste nada, pero fue un gran show.`
      ]
      message = pickRandom(neutralMessages)
    }

    user.lastadventure = Date.now() + 20 * 60 * 1000
    await client.sendMessage(m.chat, { text: `${message}\n\n*¡El entretenimiento es la moneda del alma!*` }, { quoted: m })
  },
}

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const min = minutes < 10 ? '0' + minutes : minutes
  const sec = seconds < 10 ? '0' + seconds : seconds
  return min === '00' ? `${sec} segundo${sec > 1 ? 's' : ''}` : `${min} minuto${min > 1 ? 's' : ''}, ${sec} segundo${sec > 1 ? 's' : ''}`
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}
