import fetch from 'node-fetch';
import { resolveLidToRealJid } from "../../lib/utils.js"

const captions = {
  peek: (from, to, genero) => from === to ? 'está espiando detrás de una puerta como Alastor planeando algo.' : `está acechando desde las sombras a`,
  comfort: (from, to) => (from === to ? 'se está dando ánimos porque el Infierno es duro.' : 'está intentando consolar (a su manera) a'),
  thinkhard: (from, to) => from === to ? 'está procesando una idea tan loca como las de Charlie.' : 'está analizando cada pecado de',
  curious: (from, to) => from === to ? 'tiene una curiosidad nivel "Vaggie sospechando de todos".' : 'siente una curiosidad peligrosa por lo que hace',
  sniff: (from, to) => from === to ? 'está olfateando el aire... ¿huele a redención o a azufre?' : 'está olfateando descaradamente a',
  stare: (from, to) => from === to ? 'se quedó con la mirada perdida como Husk tras una noche de bar.' : 'se le queda mirando fijamente a',
  trip: (from, to) => from === to ? 'se tropezó con su propio ego, ¡qué espectáculo!' : 'tropezó accidentalmente (¿o no?) con',
  blowkiss: (from, to) => (from === to ? 'se lanza un beso al espejo, ¡derrochando estilo!' : 'le lanzó un beso pecaminoso a'),
  snuggle: (from, to) => from === to ? 'se acurruca con un peluche de Keekee.' : 'se acurruca dulcemente con',
  sleep: (from, to, genero) => from === to ? 'cayó en un sueño profundo tras una purga.' : 'se quedó a dormir (sin pagar renta) con',
  cold: (from, to, genero) => (from === to ? 'siente el frío de una noche solitaria en el Hazbin Hotel.' : 'busca calorcito pegándose a'),
  sing: (from, to, genero) => (from === to ? 'empezó un número musical improvisado.' : 'le está cantando una canción de redención a'),
  tickle: (from, to, genero) => from === to ? 'se está haciendo cosquillas por puro nerviosismo.' : 'le está haciendo cosquillas infernales a',
  scream: (from, to, genero) => (from === to ? 'está pegando un grito que despertaría a los Overlords.' : 'le está gritando sus verdades a'),
  push: (from, to, genero) => (from === to ? 'se empujó al abismo del sarcasmo.' : 'le dio un empujón digno de Angel Dust a'),
  nope: (from, to, genero) => (from === to ? 'dice "¡Ni hablar!", ni que fuera una oferta de Alastor.' : 'le dice un rotundo "¡NO!" a'),
  jump: (from, to, genero) => (from === to ? 'salta de alegría como Charlie con un nuevo huésped.' : 'salta de emoción junto a'),
  heat: (from, to, genero) => (from === to ? 'siente que el calor del Infierno está subiendo de nivel.' : 'se está sofocando por culpa de'),
  gaming: (from, to, genero) => (from === to ? 'está apostando su alma en un juego solitario.' : 'está perdiendo sus ahorros jugando con'),
  draw: (from, to, genero) => (from === to ? 'hace un dibujo... ¿eso es un retrato de Lucifer?' : 'está dibujando algo muy cuestionable sobre'),
  call: (from, to, genero) => from === to ? 'está llamando a soporte técnico del Cielo.' : 'está acosando telefónicamente a',
  seduce: (from, to, genero) => from === to ? 'está practicando sus dotes de seducción frente al vacío.' : 'está usando todo su encanto de estrella porno con',
  shy: (from, to, genero) => from === to ? `se sonrojó más que Sir Pentious tras un cumplido.` : `se siente demasiado ${genero === 'Hombre' ? 'tímido' : genero === 'Mujer' ? 'tímida' : 'tímide'} para ver a los ojos a`,
  slap: (from, to, genero) => from === to ? `se dio una bofetada para reaccionar.` : 'le dio un bofetón de realidad a',
  bath: (from, to) => (from === to ? 'se está bañando en las aguas del Infierno.' : 'está intentando bañar (a la fuerza) a'),
  angry: (from, to, genero) => from === to ? `está más ${genero === 'Hombre' ? 'enojado' : genero === 'Mujer' ? 'enojada' : 'enojadx'} que Vaggie sin café.` : `está sacando sus garras contra`,
  bored: (from, to, genero) => from === to ? `está más ${genero === 'Hombre' ? 'aburrido' : genero === 'Mujer' ? 'aburrida' : 'aburridx'} que Husk en la recepción.` : `se aburrió de la existencia de`,
  bite: (from, to, genero) => from === to ? `se mordió por accidente, ¡ay!` : 'le dio una mordidita juguetona (o caníbal) a',
  bleh: (from, to) => from === to ? 'está haciendo muecas como Niffty persiguiendo bichos.' : 'le está sacando la lengua con descaro a',
  bonk: (from, to, genero) => from === to ? `se dio un golpe por andar de distraídx.` : 'le dio un bonk en la cabeza a',
  blush: (from, to) => (from === to ? 'se puso tan rojo como el traje de Alastor.' : 'se sonrojó por los comentarios de'),
  impregnate: (from, to) => (from === to ? 'está en espera de un pequeño demonio.' : 'decidió que era buen momento para preñar a'),
  bully: (from, to, genero) => from === to ? `se está autosaboteando, ¡necesita una charla con Charlie!` : 'le está haciendo la vida imposible a',
  cry: (from, to) => (from === to ? 'está llorando porque no hay redención hoy.' : 'está llorando en el hombro de'),
  happy: (from, to) => (from === to ? 'está más feliz que Charlie en un arcoíris.' : 'comparte su alegría infernal con'),
  coffee: (from, to) => (from === to ? 'está tomando café para aguantar este caos.' : 'está compartiendo un café negro como el alma de'),
  clap: (from, to) => (from === to ? 'aplaude con sarcasmo nivel Overlord.' : 'aplaude por el show que dio'),
  cringe: (from, to) => (from === to ? 'siente un cringe que le llega hasta el alma.' : 'siente una pena ajena increíble por'),
  dance: (from, to) => (from === to ? 'está bailando un jazz muy animado.' : 'está bailando un vals prohibido con'),
  cuddle: (from, to, genero) => from === to ? `se hizo bolita en el sofá del lobby.` : 'está buscando mimos de',
  drunk: (from, to, genero) => from === to ? `se pasó de tragos en el bar de Husk.` : `está compartiendo una borrachera épica con`,
  dramatic: (from, to) => from === to ? 'está haciendo un drama digno de una telenovela demoníaca.' : 'le está armando un berrinche a',
  handhold: (from, to, genero) => from === to ? `se agarra la mano para no sentirse ${genero === 'Hombre' ? 'solo' : genero === 'Mujer' ? 'sola' : 'solx'}.` : 'le tomó la mano con mucha confianza a',
  eat: (from, to) => (from === to ? 'está devorando algo delicioso (esperemos que no sea un pecador).' : 'está cenando con'),
  highfive: (from, to) => from === to ? 'chocó los cinco con su propia sombra.' : 'chocó los cinco con',
  hug: (from, to, genero) => from === to ? `necesita un abrazo de grupo urgente.` : 'le dio un abrazo muy apretado a',
  kill: (from, to) => (from === to ? 'hizo un trato que no debió y se auto-eliminó.' : 'mandó directamente al doble infierno a'),
  kiss: (from, to) => (from === to ? 'está lanzando besos al aire como una estrella.' : 'le plantó un beso a'),
  kisscheek: (from, to) => from === to ? 'se dio un beso en la mano, ¡qué egocéntrico!' : 'le dio un beso tierno en la mejilla a',
  lick: (from, to) => (from === to ? 'se lamió... ¿por qué haces eso?' : 'lamió de forma extraña a'),
  laugh: (from, to) => (from === to ? 'se ríe con malicia pura.' : 'se está burlando de las desgracias de'),
  pat: (from, to) => (from === to ? 'se acaricia el cabello sintiéndose fabuloso.' : 'le da palmaditas en la cabeza a'),
  love: (from, to, genero) => from === to ? `se ama más que Adam a sí mismo.` : 'siente un amor prohibido por',
  pout: (from, to, genero) => from === to ? `está haciendo un puchero muy tierno.` : 'está haciendo muecas frente a',
  punch: (from, to) => (from === to ? 'lanzó un golpe al aire practicando para la purga.' : 'le acomodó un buen puñetazo a'),
  run: (from, to) => (from === to ? 'corre como si lo persiguiera Sir Pentious con un rayo láser.' : 'está huyendo despavorido de'),
  scared: (from, to, genero) => from === to ? `está aterradx, ¡parece que vio a Alastor sin sonrisa!` : `está temblando de miedo por culpa de`,
  sad: (from, to) => (from === to ? `está más triste que un ángel caído.` : `le cuenta sus penas a`),
  smoke: (from, to) => (from === to ? 'está fumando como Angel Dust tras un largo día.' : 'está compartiendo un cigarrillo con'),
  smile: (from, to) => (from === to ? 'está sonriendo porque nunca se está totalmente vestido sin una.' : 'le dedicó una sonrisa cínica a'),
  spit: (from, to, genero) => from === to ? `escupió al suelo con desdén.` : 'le escupió con odio a',
  smug: (from, to) => (from === to ? 'está presumiendo su poder como un Overlord recién llegado.' : 'le presume sus lujos a'),
  think: (from, to) => from === to ? 'está planeando su ascenso al trono.' : 'está obsesionadx pensando en',
  step: (from, to, genero) => from === to ? `se pisó la cola (si tuviera).` : 'está pisoteando el orgullo de',
  wave: (from, to, genero) => from === to ? `saluda a su reflejo en el espejo de la suite.` : 'está saludando desde lejos a',
  walk: (from, to) => (from === to ? 'camina por las calles rojas de la ciudad.' : 'está dando un paseo por el Infierno con'),
  wink: (from, to, genero) => from === to ? `guiñó un ojo con mucha picardía.` : 'le lanzó un guiño seductor a',
}

const symbols = ['(⁠◠⁠‿⁠◕⁠)', '˃͈◡˂͈', '૮(˶ᵔᵕᵔ˶)ა', '(づ｡◕‿‿◕｡)づ', '(✿◡‿◡)', '(꒪⌓꒪)', '(✿✪‿✪｡)', '(*≧ω≦)', '(✧ω◕)', '˃ 𖥦 ˂', '(⌒‿⌒)', '(¬‿¬)', '(✧ω✧)', '✿(◕ ‿◕)✿', 'ʕ•́ᴥ•̀ʔっ', '(ㅇㅅㅇ❀)', '(∩︵∩)', '(✪ω✪)', '(✯◕‿◕✯)', '(•̀ᴗ•́)و ̑̑']
function getRandomSymbol() {
  return symbols[Math.floor(Math.random() * symbols.length)]
}

const alias = {
  angry: ['angry','enojado','enojada'],
  bleh: ['bleh'],
  bored: ['bored','aburrido','aburrida'],
  clap: ['clap','aplaudir'],
  coffee: ['coffee','cafe'],
  dramatic: ['dramatic','drama'],
  drunk: ['drunk'],
  cold: ['cold'],
  impregnate: ['impregnate','preg','preñar','embarazar'],
  kisscheek: ['kisscheek','beso','besar'],
  laugh: ['laugh'],
  love: ['love','amor'],
  pout: ['pout','mueca'],
  punch: ['punch','golpear'],
  run: ['run','correr'],
  sad: ['sad','triste'],
  scared: ['scared','asustado'],
  seduce: ['seduce','seducir'],
  shy: ['shy','timido','timida'],
  sleep: ['sleep','dormir'],
  smoke: ['smoke','fumar'],
  spit: ['spit','escupir'],
  step: ['step','pisar'],
  think: ['think','pensar'],
  walk: ['walk','caminar'],
  hug: ['hug','abrazar'],
  kill: ['kill','matar'],
  eat: ['eat','nom','comer'],
  kiss: ['kiss','muak','besar'],
  wink: ['wink','guiñar'],
  pat: ['pat','acariciar'],
  happy: ['happy','feliz'],
  bully: ['bully','molestar'],
  bite: ['bite','morder'],
  blush: ['blush','sonrojarse'],
  wave: ['wave','saludar'],
  bath: ['bath','bañarse'],
  smug: ['smug','presumir'],
  smile: ['smile','sonreir'],
  highfive: ['highfive','choca'],
  handhold: ['handhold','tomar'],
  cringe: ['cringe','mueca'],
  bonk: ['bonk','golpe'],
  cry: ['cry','llorar'],
  lick: ['lick','lamer'],
  slap: ['slap','bofetada'],
  dance: ['dance','bailar'],
  cuddle: ['cuddle','acurrucar'],
  sing: ['sing','cantar'],
  tickle: ['tickle','cosquillas'],
  scream: ['scream','gritar'],
  push: ['push','empujar'],
  nope: ['nope','no'],
  jump: ['jump','saltar'],
  heat: ['heat','calor'],
  gaming: ['gaming','jugar'],
  draw: ['draw','dibujar'],
  call: ['call','llamar'],
  snuggle: ['snuggle','acurrucarse'],
  blowkiss: ['blowkiss','besito'],
  trip: ['trip','tropezar'],
  stare: ['stare','mirar'],
  sniff: ['sniff','oler'],
  curious: ['curious','curioso','curiosa'],
  thinkhard: ['thinkhard','pensar'],
  comfort: ['comfort','consolar'],
  peek: ['peek','mirar']
};

export default {
command: ['angry','enojado','enojada','bleh','bored','aburrido','aburrida','clap','aplaudir','coffee','cafe','dramatic','drama','drunk','cold','impregnate','preg','preñar','embarazar','kisscheek','beso','besar','laugh','love','amor','pout','mueca','punch','golpear','run','correr','sad','triste','scared','asustado','seduce','seducir','shy','timido','timida','sleep','dormir','smoke','fumar','spit','escupir','step','pisar','think','pensar','walk','caminar','hug','abrazar','kill','matar','eat','nom','comer','kiss','muak','wink','guiñar','pat','acariciar','happy','feliz','bully','molestar','bite','morder','blush','sonrojarse','wave','saludar','bath','bañarse','smug','presumir','smile','sonreir','highfive','choca','handhold','tomar','cringe','mueca','bonk','golpe','cry','llorar','lick','lamer','slap','bofetada','dance','bailar','cuddle','acurrucar','sing','cantar','tickle','cosquillas','scream','gritar','push','empujar','nope','no','jump','saltar','heat','calor','gaming','jugar','draw','dibujar','call','llamar','snuggle','acurrucarse','blowkiss','besito','trip','tropezar','stare','mirar','sniff','oler','curious','curioso','curiosa','thinkhard','pensar','comfort','consolar','peek','mirar'],
  category: 'anime',
  run: async (client, m, args, usedPrefix, command) => {
    const currentCommand = Object.keys(alias).find(key => alias[key].includes(command)) || command
    if (!captions[currentCommand]) return
    let mentionedJid = m.mentionedJid
    let who2 = mentionedJid.length > 0 ? mentionedJid[0] : (m.quoted ? m.quoted.sender : m.sender)
    const who = await resolveLidToRealJid(who2, client, m.chat)
    const fromName = global.db.data.users[m.sender]?.name || '@'+m.sender.split('@')[0]
    const toName = global.db.data.users[who]?.name || '@'+who.split('@')[0]
    const genero = global.db.data.users[m.sender]?.genre || 'Oculto'
    const captionText = captions[currentCommand](fromName, toName, genero)
    const caption = who !== m.sender ? `\`${fromName}.\` ${captionText} \`${toName}.\` ${getRandomSymbol()}.` : `\`${fromName}\` ${captionText} ${getRandomSymbol()}.`
    try {
      const response = await fetch(`https://api.stellarwa.xyz/sfw/interaction?inter=${currentCommand}`)
      const json = await response.json()
      const { result } = json
      await client.sendMessage(m.chat, { video: { url: result }, gifPlayback: true, caption, mentions: [who, m.sender] }, { quoted: m })
    } catch (e) {
    await m.reply(`> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again o contact support if the issue persists.\n> [Error: *${e.message}*]`)
    }
  },
};
