import '../stylesheets/animation.css'

document.addEventListener('DOMContentLoaded', () => {
  createWords()
  setInterval(() => {
    moveInfoItems()
  }, 5000)
  console.log('работай ')
})

function createWords() {
  const section = document.querySelector('#words')

  const words = [
    'палатка',
    'тушенка',
    'чилл',
    'коммьюнити',
    'свежий воздух',
    'запах сосен',
    'туалетная поэзия',
    'народ среди пеньков',
    'умные люди',
    'шитояма',
    'шанхай',
    'очень холодно',
    'полевой лагерь',
    'гречка',
    'каны',
    'завтрак на природе',
    'ежики',
    'недосып',
    'смех до полуночи',
    'спокойствие',
    'классная тусовка',
    'учёба в радость',
    'чечевица',
    'вкусно',
    'всё равно на внешний вид',
    'стиль',
    'модные люди',
    'Волга',
    'люди',
    'Дубна',
    'КПП',
    'лес',
    'песок',
    'ништяк',
    'ежи',
    'подстреленные ежи',
    'комары',
    'знакомства',
    'солнечно',
    'муравьи',
    'сосны',
    'ели',
    'учёба',
    'ништяки',
    'лягушечки',
    'живность',
    'солнечная сосна',
    'паяльник',
    'всё проебали',
    'есть идея',
    'вау',
    'нет идей',
    'лекторий',
    'встретимся под соснами',
    'грохот мисок',
    'влажность',
    'Гриша Тарасевич',
    'каша',
    'каша Тарасевича',
    'пиздец',
    'творчество',
    'эксперимент',
    '«я тут свой»',
    '«ты не один»',
    'душ-вагочик',
    'раскайфовка',
    'пионерлагерь',
    'единение',
    'фингерстадис',
    'гамаки',
    'горячий стол',
    'шишки',
    'прислонята'
  ]

  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const htmlWord = document.createElement('div')
    htmlWord.classList.add('word')
    htmlWord.style.color = getRandomColor()
    htmlWord.innerText = word
    section.appendChild(htmlWord)
  }

  moveInfoItems()
}

function moveInfoItems() {
  const items = document.querySelectorAll('.word')
  const section = document.querySelector('#words')

  for (let i = 0; i < items.length; i++) {
    const item = items[i]

    const { width, height } = item.getBoundingClientRect()

    const sectionWidth = section.getBoundingClientRect().width
    const sectionHeight = section.getBoundingClientRect().height

    item.style.animationDelay = `-${Math.random() * i}s`
    item.style.top = `${getRandomArbitrary(0, sectionHeight - height)}px`
    item.style.left = `${getRandomArbitrary(0, sectionWidth - width)}px`
  }
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min
}

function getRandomColor() {
  const colors = [
    'cadetblue',
    'burlywood',
    'green',
    'firebrick',
    'purple',
    'gold',
    'cornflowerblue',
    'blue',
    'magenta',
    'orange'
  ]

  const i = Math.floor(Math.random() * colors.length)
  const color = colors[i]

  return color
}
