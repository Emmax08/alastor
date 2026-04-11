export default {
  command: ['restart', 'reiniciar'],
  category: 'mod',
  isOwner: true,
  run: async (client, m) => {
    // Mensaje de despedida antes del reinicio
    await client.reply(m.chat, `✎ Reiniciando el infierno...\n> *Prepárate para el vacío...*`, m)

    // Breve espera para asegurar que el mensaje se envíe antes de matar el proceso
    setTimeout(() => {
      if (process.send) {
        process.send("restart")
      } else {
        process.exit(0)
      }
    }, 3000)
  },
  // Nota: El mensaje de "vuelto a encender" debe configurarse en tu archivo principal (index.js o main.js)
  // ya que el plugin se descarga de la memoria al reiniciarse el proceso.
};
