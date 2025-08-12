import '../stylesheets/slider.css'

const crystal = document.querySelector('.crystal')
const totalFrames = 12 // число кадров в спрайте

// Инициализация Swiper
const swiper = new Swiper('.swiper', {
  slidesPerView: 1,
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev'
  },
  on: {
    // slideChange: () => {
    //   const index = swiper.realIndex % totalFrames // выбираем кадр по индексу слайда
    //   const posX = -(index * 100) / (totalFrames - 1) // позиция в процентах
    //   // Меняем позицию спрайта с анимацией
    //   crystal.style.backgroundPosition = `${posX}% 0`
    // }
  }
})

// При загрузке выставим начальный кадр
// crystal.style.backgroundPosition = '0% 0'
