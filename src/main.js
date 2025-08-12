// Инициализация Swiper
const swiper = new Swiper('.swiper', {
  navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
  loop: true,
  speed: 700,
  on: {
    slideChange: () => {
      onSlideChange()
    }
  }
})

/* THREE.js сцена с HDRI окружением и физическим стеклянным материалом */
let scene, camera, renderer, crystalMesh, pmremGenerator, clock
let container = document.querySelector('.crystal-3d')

function initThree() {
  // Сцена и камера
  scene = new THREE.Scene()
  clock = new THREE.Clock()

  const width = container.clientWidth
  const height = container.clientHeight
  camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100)
  camera.position.set(0, 0, 6)

  // Рендерер
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.physicallyCorrectLights = true
  renderer.outputEncoding = THREE.sRGBEncoding
  container.appendChild(renderer.domElement)

  // PMREM для окружения (будет создан позже после загрузки текстуры)
  pmremGenerator = new THREE.PMREMGenerator(renderer)
  pmremGenerator.compileEquirectangularShader()

  // Дополнительные источники света для контраста (ненавязчивые)
  const fill = new THREE.DirectionalLight(0xffffff, 0.25)
  fill.position.set(-5, 5, 5)
  scene.add(fill)

  const rim = new THREE.DirectionalLight(0xffffff, 0.15)
  rim.position.set(5, -2, -2)
  scene.add(rim)

  // Создаём базовую геометрию кристалла:
  // Идея: комбинируем icosahedron + дополнительные "шипы" через модификацию вершин
  const baseGeo = new THREE.IcosahedronGeometry(1.2, 2)

  // Чтобы добавить острые грани, подвинем случайно некоторые вершины вдоль их нормалей
  const position = baseGeo.attributes.position
  const vertexCount = position.count
  const offsets = new Float32Array(vertexCount) // запомним для деформаций later

  for (let i = 0; i < vertexCount; i++) {
    // случайный небольшой оффсет (будем анимировать его)
    const off = Math.random() * 0.4 - 0.05
    offsets[i] = off
    // сместим точку вдоль нормали
    const nx = baseGeo.attributes.normal.getX(i)
    const ny = baseGeo.attributes.normal.getY(i)
    const nz = baseGeo.attributes.normal.getZ(i)
    position.setXYZ(
      i,
      position.getX(i) + nx * off,
      position.getY(i) + ny * off,
      position.getZ(i) + nz * off
    )
  }
  baseGeo.attributes.position.needsUpdate = true
  baseGeo.computeVertexNormals()

  // Материал: физически корректный стеклянный
  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(0xffffff),
    metalness: 0,
    roughness: 0,
    clearcoat: 1.0,
    clearcoatRoughness: 0,
    transmission: 1.0, // make it see-through
    thickness: 0.8, // depth for transmission
    ior: 1.45, // индекс преломления (glass ≈1.5)
    envMapIntensity: 1.2,
    reflectivity: 0.5,
    transparent: true
  })

  crystalMesh = new THREE.Mesh(baseGeo, material)
  scene.add(crystalMesh)

  // Немного масштабируем и смещаем чтобы выглядело правее/ниже (оптическая позиция в контейнере)
  crystalMesh.position.set(0.2, -0.05, 0)
  crystalMesh.scale.setScalar(1.0)

  // Загрузим equirectangular картинку окружения (используем jpg, HDR требует RGBELoader; для простоты используем jpg)
  // Источник: three.js примеры — если CORS мешает, положи картинку локально или используй другой URL.
  const envUrl =
    'https://threejs.org/examples/textures/equirectangular/royal_esplanade_1k.jpg'

  const texLoader = new THREE.TextureLoader()
  texLoader.crossOrigin = ''
  texLoader.load(
    envUrl,
    (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping // important
      const envMap = pmremGenerator.fromEquirectangular(texture).texture
      scene.environment = envMap // для отражений/преломлений
      scene.background = null
      texture.dispose()
      pmremGenerator.dispose()
    },
    undefined,
    (err) => {
      console.warn('Ошибка загрузки окружения HDR:', err)
    }
  )

  // Обработчик ресайза
  window.addEventListener('resize', onWindowResize, false)

  animate() // запустить цикл
}

function onWindowResize() {
  const w = container.clientWidth
  const h = container.clientHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
}

// Анимация рендера
function animate() {
  requestAnimationFrame(animate)
  const t = clock.getElapsedTime()

  // Небольшая постоянная орбитальная анимация
  crystalMesh.rotation.x = 0.15 * Math.sin(t * 0.3) + 0.2
  crystalMesh.rotation.y += 0.003

  // Лекая пульсация толщины / ior для живости
  const mat = crystalMesh.material
  if (mat && mat.transmission !== undefined) {
    mat.thickness = 0.7 + Math.sin(t * 1.1) * 0.08
    mat.ior = 1.4 + Math.sin(t * 0.6) * 0.03
  }

  renderer.render(scene, camera)
}

/* --- Реакция на смену слайда: меняем форму / цвет / вращение / освещение --- */
function onSlideChange() {
  // 1) сильный поворот + easing
  gsap.to(crystalMesh.rotation, {
    x: crystalMesh.rotation.x + (Math.PI * 0.3 + Math.random() * Math.PI),
    y: crystalMesh.rotation.y + (Math.PI * 0.3 + Math.random() * Math.PI),
    duration: 1.2,
    ease: 'power3.inOut'
  })

  // 2) масштаб-пульс
  gsap.fromTo(
    crystalMesh.scale,
    { x: 0.9, y: 0.9, z: 0.9 },
    {
      x: 1.07 + Math.random() * 0.15,
      y: 1.07 + Math.random() * 0.15,
      z: 1.07 + Math.random() * 0.15,
      duration: 1.0,
      ease: 'elastic.out(1, 0.6)'
    }
  )

  // 3) изменим tint (цвет материала) и envMapIntensity немного
  const mat = crystalMesh.material
  const targetColor = new THREE.Color().setHSL(
    Math.random(),
    0.3 + Math.random() * 0.4,
    0.6
  )
  gsap.to(mat, {
    duration: 1.2,
    onStart() {
      mat.needsUpdate = true
    },
    onUpdate() {
      mat.needsUpdate = true
    },
    // анимируем цвет вручную через r,g,b
    r: targetColor.r,
    g: targetColor.g,
    b: targetColor.b,
    silent: true,
    ease: 'power2.inOut',
    // т.к. GSAP не знает как напрямую менять THREE.Color на материале, делаем через прокси
    onComplete() {
      mat.color.copy(targetColor)
    }
  })

  // 4) envMapIntensity / roughness tweak
  gsap.to(mat, {
    duration: 1.0,
    envMapIntensity: 0.8 + Math.random() * 1.2,
    roughness: Math.random() * 0.12,
    ease: 'power2.inOut'
  })

  // 5) лёгкая деформация геометрии: смещаем вершины вдоль нормалей на короткую анимацию
  const geo = crystalMesh.geometry
  if (geo && geo.attributes.position) {
    const pos = geo.attributes.position
    const normal = geo.attributes.normal
    const vc = pos.count

    // создадим массив целевых смещений
    const targets = new Float32Array(vc)
    for (let i = 0; i < vc; i++) {
      // целевой оффсет в диапазоне [-0.25, 0.5] (чтобы получить острые пики и плоские грани)
      targets[i] =
        (Math.random() * 0.6 - 0.2) * (Math.random() > 0.7 ? 1.6 : 1.0)
    }

    // gsap для анимации смещений: применяем временные смещения к атрибуту позиции
    const start = performance.now()
    const dur = 900 + Math.random() * 800

    const initialPositions = new Float32Array(pos.array) // копия начальной позиции

    gsap.to(
      { t: 0 },
      {
        t: 1,
        duration: dur / 1000,
        ease: 'power2.inOut',
        onUpdate: function () {
          const k = this.targets()[0].t // 0..1
          for (let i = 0; i < vc; i++) {
            const nx = normal.getX(i)
            const ny = normal.getY(i)
            const nz = normal.getZ(i)

            const idx = i * 3
            const ix = initialPositions[idx]
            const iy = initialPositions[idx + 1]
            const iz = initialPositions[idx + 2]

            // интерполируем смещение
            const off = targets[i] * k
            pos.array[idx] = ix + nx * off
            pos.array[idx + 1] = iy + ny * off
            pos.array[idx + 2] = iz + nz * off
          }
          pos.needsUpdate = true
          geo.computeVertexNormals()
        },
        onComplete: function () {
          // на фейде обратно к исходной форме — плавно вернёмся через обратную анимацию
          gsap.to(
            { t: 1 },
            {
              t: 0,
              duration: 0.8,
              ease: 'power2.inOut',
              onUpdate: function () {
                const k2 = this.targets()[0].t
                for (let i = 0; i < vc; i++) {
                  const nx = normal.getX(i)
                  const ny = normal.getY(i)
                  const nz = normal.getZ(i)

                  const idx = i * 3
                  const ix = initialPositions[idx]
                  const iy = initialPositions[idx + 1]
                  const iz = initialPositions[idx + 2]

                  const off = targets[i] * k2
                  pos.array[idx] = ix + nx * off
                  pos.array[idx + 1] = iy + ny * off
                  pos.array[idx + 2] = iz + nz * off
                }
                pos.needsUpdate = true
                geo.computeVertexNormals()
              }
            }
          )
        }
      }
    )
  }

  // 6) можно также анимировать источники света — делаем мягкую смену цвета
  scene.traverse((obj) => {
    if (obj.isLight && !(obj instanceof THREE.AmbientLight)) {
      const c = new THREE.Color().setHSL(
        Math.random(),
        0.4 + Math.random() * 0.5,
        0.5 + Math.random() * 0.2
      )
      gsap.to(obj.color, {
        r: c.r,
        g: c.g,
        b: c.b,
        duration: 1.1,
        ease: 'power2.inOut'
      })
      gsap.to(obj, {
        intensity: 0.4 + Math.random() * 1.2,
        duration: 1.1,
        ease: 'power2.inOut'
      })
    }
  })
}

initThree()
