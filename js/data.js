/* ===== Paso a Paso: Leo Puerto Rico — Datos educativos ===== */

const DATA = {
  consonantGroups: [
    { id: 1, name: "Grupo 1: m, p, s, l", active: true, letters: ["m","p","s","l"] },
    { id: 2, name: "Grupo 2: t, n, d, f", active: true, letters: ["t","n","d","f"] },
    { id: 3, name: "Grupo 3: r, rr, b, v", active: true, letters: ["r","rr","b","v"] },
    { id: 4, name: "Grupo 4: c, q, g, j", active: true, letters: ["c","q","g","j"] },
    { id: 5, name: "Grupo 5: h, ch, y, ll, ñ", active: true, letters: ["h","ch","y","ll","ñ"] },
    { id: 6, name: "Grupo 6: k, w, x, z", active: true, letters: ["k","w","x","z"] },
  ],

  letters: {
    "m":  { upper:"M", lower:"m", emoji:"🥭", words:["mango","mano","mapa"], sound:"eme" },
    "p":  { upper:"P", lower:"p", emoji:"🌴", words:["palma","pato","pan"], sound:"pe" },
    "s":  { upper:"S", lower:"s", emoji:"☀️", words:["sol","sopa","sala"], sound:"ese" },
    "l":  { upper:"L", lower:"l", emoji:"🌙", words:["luna","lápiz","limón"], sound:"ele" },
    "t":  { upper:"T", lower:"t", emoji:"🥁", words:["tambor","taza","tela"], sound:"te" },
    "n":  { upper:"N", lower:"n", emoji:"🐦", words:["nido","nube","niña"], sound:"ene" },
    "d":  { upper:"D", lower:"d", emoji:"🎲", words:["dado","dedo","dulce"], sound:"de" },
    "f":  { upper:"F", lower:"f", emoji:"🌸", words:["flor","faro","familia"], sound:"efe" },
    "r":  { upper:"R", lower:"r", emoji:"🐸", words:["rana","remo","río"], sound:"erre" },
    "rr": { upper:"RR", lower:"rr", emoji:"🐕", words:["perro","carro","barro"], sound:"erre doble" },
    "b":  { upper:"B", lower:"b", emoji:"⛵", words:["barco","bomba","bola"], sound:"be" },
    "v":  { upper:"V", lower:"v", emoji:"🕯️", words:["vela","vaso","ventana"], sound:"uve" },
    "c":  { upper:"C", lower:"c", emoji:"🏠", words:["casa","coco","cama"], sound:"ce" },
    "q":  { upper:"Q", lower:"q", emoji:"🧀", words:["queso","maquina","paquete"], sound:"cu" },
    "g":  { upper:"G", lower:"g", emoji:"🐱", words:["gato","gorra","guagua"], sound:"ge" },
    "j":  { upper:"J", lower:"j", emoji:"🧃", words:["jugo","jaiba","jardín"], sound:"jota" },
    "h":  { upper:"H", lower:"h", emoji:"🍦", words:["helado","hoja","hilo"], sound:"hache (no suena)" },
    "ch": { upper:"CH", lower:"ch", emoji:"🍫", words:["chocolate","chinchorro","chaqueta"], sound:"che" },
    "y":  { upper:"Y", lower:"y", emoji:"🥔", words:["yuca","yoyo","yema"], sound:"ye" },
    "ll": { upper:"LL", lower:"ll", emoji:"🌧️", words:["lluvia","llave","llama"], sound:"elle" },
    "ñ":  { upper:"Ñ", lower:"ñ", emoji:"🍠", words:["ñame","niño","mañana"], sound:"eñe" },
    "k":  { upper:"K", lower:"k", emoji:"🐨", words:["koala","kilo","kayak"], sound:"ka" },
    "w":  { upper:"W", lower:"w", emoji:"📶", words:["wifi","wafle","whisky"], sound:"uve doble" },
    "x":  { upper:"X", lower:"x", emoji:"🎼", words:["xilófono","experto","axila"], sound:"equis" },
    "z":  { upper:"Z", lower:"z", emoji:"👟", words:["zapato","zorro","zanahoria"], sound:"zeta" },
  },

  vowels: ["a","e","i","o","u"],

  // Sílabas especiales (combinaciones que no siguen consonante+vocal simple)
  specialSyllables: {
    "q": ["que","qui"],
    "g": ["gue","gui"],
  },

  words: {
    1: [
      { text:"mamá", emoji:"👩", syllables:["ma","má"] },
      { text:"mano", emoji:"✋", syllables:["ma","no"] },
      { text:"mapa", emoji:"🗺️", syllables:["ma","pa"] },
      { text:"mesa", emoji:"🍽️", syllables:["me","sa"] },
      { text:"mimo", emoji:"🤹", syllables:["mi","mo"] },
      { text:"pato", emoji:"🦆", syllables:["pa","to"] },
      { text:"pala", emoji:"🪏", syllables:["pa","la"] },
      { text:"sopa", emoji:"🍲", syllables:["so","pa"] },
      { text:"sala", emoji:"🚪", syllables:["sa","la"] },
      { text:"sol", emoji:"☀️", syllables:["sol"] },
      { text:"sal", emoji:"🧂", syllables:["sal"] },
      { text:"luna", emoji:"🌙", syllables:["lu","na"] },
      { text:"lata", emoji:"🥫", syllables:["la","ta"] },
      { text:"tela", emoji:"🧵", syllables:["te","la"] },
      { text:"nene", emoji:"👦", syllables:["ne","ne"] },
      { text:"nido", emoji:"🐦", syllables:["ni","do"] },
      { text:"dado", emoji:"🎲", syllables:["da","do"] },
      { text:"dedo", emoji:"👆", syllables:["de","do"] },
      { text:"flor", emoji:"🌸", syllables:["flor"] },
      { text:"faro", emoji:"🗼", syllables:["fa","ro"] },
    ],
    2: [
      { text:"mango", emoji:"🥭", syllables:["man","go"] },
      { text:"palma", emoji:"🌴", syllables:["pa","lma"] },
      { text:"bomba", emoji:"🥁", syllables:["bom","ba"] },
      { text:"barco", emoji:"⛵", syllables:["bar","co"] },
      { text:"coco", emoji:"🥥", syllables:["co","co"] },
      { text:"casa", emoji:"🏠", syllables:["ca","sa"] },
      { text:"yuca", emoji:"🥔", syllables:["yu","ca"] },
      { text:"ñame", emoji:"🍠", syllables:["ña","me"] },
      { text:"guagua", emoji:"🚌", syllables:["gua","gua"] },
      { text:"jaiba", emoji:"🦀", syllables:["jai","ba"] },
      { text:"güiro", emoji:"🎶", syllables:["güi","ro"] },
      { text:"tambor", emoji:"🥁", syllables:["tam","bor"] },
      { text:"playa", emoji:"🏖️", syllables:["pla","ya"] },
      { text:"ola", emoji:"🌊", syllables:["o","la"] },
      { text:"río", emoji:"🏞️", syllables:["río"] },
    ],
  },

  phrases: [
    { text:"Mamá me ama.", emoji:"👩‍👧", question:"¿Quién está en la frase?", options:["Mamá","El sol","El pato"], answer:0 },
    { text:"La mano saluda.", emoji:"✋", question:"¿Qué hace la mano?", options:["Saluda","Come","Duerme"], answer:0 },
    { text:"El sol sale.", emoji:"☀️", question:"¿Qué aparece en la frase?", options:["La luna","El sol","La nube"], answer:1 },
    { text:"La palma se mueve.", emoji:"🌴", question:"¿Qué hace la palma?", options:["Crece","Se mueve","Cae"], answer:1 },
    { text:"La guagua pasa.", emoji:"🚌", question:"¿Qué pasa?", options:["El barco","La guagua","El mango"], answer:1 },
    { text:"El coquí canta.", emoji:"🐸", question:"¿Quién canta?", options:["El pato","El coquí","La niña"], answer:1 },
    { text:"La ola sube.", emoji:"🌊", question:"¿Qué hace la ola?", options:["Sube","Baja","Camina"], answer:0 },
    { text:"El mango está maduro.", emoji:"🥭", question:"¿Cómo está el mango?", options:["Verde","Maduro","Frío"], answer:1 },
    { text:"La niña lee.", emoji:"👧", question:"¿Qué hace la niña?", options:["Lee","Escribe","Juega"], answer:0 },
    { text:"El niño mira el mapa.", emoji:"👦", question:"¿Qué mira el niño?", options:["El mapa","El libro","La luna"], answer:0 },
  ],

  books: [
    {
      title: "El coquí y la luna",
      pages: [
        { text:"El coquí mira la luna.", emoji:"🐸🌙" },
        { text:"El coquí salta en la hoja.", emoji:"🐸🍃" },
        { text:"La luna brilla.", emoji:"🌙✨" },
        { text:"El coquí canta.", emoji:"🐸🎵" },
        { text:"Fin. ¿Qué hizo el coquí?", emoji:"🐸", question:"¿Qué hizo el coquí?", options:["Cantar","Volar","Nadar"], answer:0 },
      ],
    },
    {
      title: "El mango de la palma",
      pages: [
        { text:"Hay un mango en la palma.", emoji:"🥭🌴" },
        { text:"El mango está maduro.", emoji:"🥭" },
        { text:"Mamá mira el mango.", emoji:"👩🥭" },
        { text:"El mango cae.", emoji:"🥭⬇️" },
        { text:"Fin. ¿Dónde estaba el mango?", emoji:"🥭", question:"¿Dónde estaba el mango?", options:["En la palma","En el suelo","En el río"], answer:0 },
      ],
    },
  ],

  rutaSteps: [
    { num:1, text:"Escucho y miro el sonido.", section:"sonidos" },
    { num:2, text:"Relaciono el sonido y la letra.", section:"sonidos" },
    { num:3, text:"Formo sílabas.", section:"silabas" },
    { num:4, text:"Leo palabras.", section:"palabras" },
    { num:5, text:"Leo frases cortas.", section:"frases" },
    { num:6, text:"Cuento lo que entendí.", section:"biblioteca" },
  ],

  feedback: {
    correct: [
      "¡Muy bien! Escuchaste y encontraste la respuesta correcta.",
      "¡Excelente esfuerzo! Puedes practicar otra vez.",
      "¡Lo logramos juntos! Sigamos con calma.",
    ],
    retry: [
      "¡Buen intento! Escuchemos el sonido otra vez.",
      "Vamos paso a paso. Mira la letra y escucha su sonido.",
      "Lo intentamos otra vez. Tú puedes.",
    ],
  },
};
