const crystalGeometries = [
  new THREE.OctahedronGeometry(3, 0),
  new THREE.IcosahedronGeometry(3, 0),
  new THREE.DodecahedronGeometry(3, 0)
]

const crystalColors = [0xfff3e0, 0xe0f7fa, 0xf3e5f5, 0xffebee]

const scenes = []

document.querySelectorAll('.crystal-3d').forEach((container, index) => {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  )
  camera.position.z = 10

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  container.appendChild(renderer.domElement)

  const light1 = new THREE.PointLight(0xffffff, 1)
  light1.position.set(5, 5, 5)
  scene.add(light1)

  const light2 = new THREE.PointLight(0xffffff, 0.5)
  light2.position.set(-5, -5, -5)
  scene.add(light2)

  const geometry = crystalGeometries[index % crystalGeometries.length]
  const material = new THREE.MeshPhongMaterial({
    color: crystalColors[index % crystalColors.length],
    shininess: 100,
    reflectivity: 1,
    transparent: true,
    opacity: 0.9
  })

  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  scenes.push({ scene, camera, renderer, mesh })
})

// Анимация вращения
function animate() {
  requestAnimationFrame(animate)
  scenes.forEach(({ mesh, renderer, scene, camera }) => {
    mesh.rotation.x += 0.003
    mesh.rotation.y += 0.004
    renderer.render(scene, camera)
  })
}
animate()

// Swiper
const swiper = new Swiper('.swiper', {
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev'
  },
  loop: true,
  on: {
    slideChange: () => {
      const activeIndex = swiper.realIndex
      const { mesh } = scenes[activeIndex]
      // Смена формы и цвета
      mesh.geometry =
        crystalGeometries[Math.floor(Math.random() * crystalGeometries.length)]
      mesh.material.color.set(
        crystalColors[Math.floor(Math.random() * crystalColors.length)]
      )
    }
  }
})
