import React, { useState } from 'react'
import * as THREE from 'three'
import * as dat from 'dat.gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { RenderPass } from '@/lib/RenderPass.js'
import { UnrealBloomPass } from '@/lib/UnrealBloomPass.js'
import { EffectComposer } from '@/lib/EffectComposer.js'
import { ShaderPass } from '@/lib/ShaderPass.js'
import { CopyShader } from '@/lib/CopyShader.js'
import Stats from 'stats-js'

import { range } from '@/components/range'
import { node } from '@/components/node'
import { randomRange } from '@/components/randomRange'
import { Triangle } from '@/components/Triangle'
import './App.less'

const N = 265
// 初始化
function init(audioUrl, positionZ) {
  // WebGL Render WebGL渲染器
  // antialias - 是否执行抗锯齿。默认为false.
  // alpha - canvas是否包含alpha (透明度)。默认为 false
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  // 创建一个新的场景对象
  const scene = new THREE.Scene()
  // 透视相机,这一投影模式被用来模拟人眼所看到的景象，它是3D场景的渲染中使用得最普遍的投影模式
  //  PerspectiveCamera( fov : Number, aspect : Number, near : Number, far : Number )
  // fov — 摄像机视锥体垂直视野角度
  // aspect — 摄像机视锥体长宽比
  // near — 摄像机视锥体近端面
  // far — 摄像机视锥体远端面
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000)
  // 目的是使得组中对象在语法上的结构更加清晰
  const TriangleGroup = new THREE.Group()

  // 加载音频 start
  // AudioListener 用一个虚拟的listener表示在场景中所有的位置和非位置相关的音效.
  const listener = new THREE.AudioListener() // 监听者
  // 创建一个（ 全局 ) audio对象.
  // listener — (必须) AudioListener 的实例.
  const audio = new THREE.Audio(listener) // 非位置音频对象

  renderer.setClearAlpha(0)
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  // scene.background = new THREE.TextureLoader().load(require('@/assets/bg2.jpg'));

  // {
  scene.background = new THREE.CubeTextureLoader().load([
    require('@/assets/skybox/right.jpg'),
    require('@/assets/skybox/left.jpg'),
    require('@/assets/skybox/top.jpg'),
    require('@/assets/skybox/bottom.jpg'),
    require('@/assets/skybox/front.jpg'),
    require('@/assets/skybox/back.jpg')
  ])
  // }

  camera.position.z = positionZ
  // @todo
  window.addEventListener('resize', onWindowResize, false)
  // @to do
  audioLines(20, N)
  // audioBars(25, N / 2) // 添加音频柱子

  // @todo
  // setInterval(addTriangle.bind(this), 500)
  // scene.add(TriangleGroup)

  // //  @todo
  // audioLoad(audioUrl)
  // // 加载音频 end

  // initLight()
  // initControls()

  // initGui()
  // initBloomPass()

  // initStats()
  // animate()
  return {
    renderer,
    scene,
    camera,
    TriangleGroup,
    listener,
    audio
  }
}
// 加载音频
async function audioLoad(audio, url) {
  // const [analyser, setAnalyser] = useState(null)
  let analyser,
    audioLoader = new THREE.AudioLoader() // 音频加载器
  await audioLoader.load(url, function (AudioBuffer) {
    if (audio.isPlaying) {
      audio.stop()
      audio.setBuffer()
    }
    audio.setBuffer(AudioBuffer) // 音频缓冲区对象关联到音频对象audio
    audio.setLoop(true) //是否循环
    audio.setVolume(1) //音量
    audio.play() //播放
    // 音频分析器和音频绑定，可以实时采集音频时域数据进行快速傅里叶变换 _that.N
    analyser = new THREE.AudioAnalyser(audio, 256 * 2)
  })

  return analyser
}

// 环境光和平行光
function initLight(scene) {
  scene.add(new THREE.AmbientLight(0x444444))
  let light = new THREE.PointLight(0xffffff)
  light.position.set(80, 100, 50)
  //告诉平行光需要开启阴影投射
  light.castShadow = true
  scene.add(light)
}

// GUI控制显示
function initGui(controls, TriangleGroup, linesGroup) {
  let gui = {
    R: 20,
    G: 90,
    B: 225,
    TrianglesBgColor: 0x03a9f4,
    TrianglesLineColor: 0x03a9f4,
    lineColor: 0x00ffff,
    rotate: false
  }
  //声明一个保存需求修改的相关数据的对象
  let datGui = new dat.GUI()
  //将设置属性添加到gui当中，gui.add(对象，属性，最小值，最大值）
  datGui.add(gui, 'R', 0, 255)
  datGui.add(gui, 'G', 0, 255)
  datGui.add(gui, 'B', 0, 255)
  datGui.add(gui, 'rotate').onChange(function (val) {
    controls.autoRotate = val
  })
  datGui.addColor(gui, 'TrianglesBgColor').onChange(function () {
    TriangleGroup.traverse(function (child) {
      if (child.isMesh)
        child.material = new THREE.MeshPhongMaterial({
          color: gui.TrianglesBgColor
        })
    })
  })
  datGui.addColor(gui, 'TrianglesLineColor').onChange(function () {
    TriangleGroup.traverse(function (child) {
      if (child.isLine)
        child.material = new THREE.LineBasicMaterial({
          color: gui.TrianglesLineColor
        })
    })
  })
  datGui.addColor(gui, 'lineColor').onChange(function () {
    linesGroup.traverse(function (child) {
      if (child.isLine)
        child.material = new THREE.LineBasicMaterial({
          color: gui.lineColor
        })
    })
  })
}
// 鼠标控制
function initControls(camera, renderer, gui) {
  const controls = new OrbitControls(camera, renderer.domElement)
  // 如果使用animate方法时，将此函数删除
  //controls.addEventListener( 'change', render );
  // 使动画循环使用时阻尼或自转 意思是否有惯性
  controls.enableDamping = true
  //动态阻尼系数 就是鼠标拖拽旋转灵敏度
  //controls.dampingFactor = 0.25;
  //是否可以缩放
  controls.enableZoom = true
  //是否自动旋转
  controls.autoRotate = gui.rotate
  //设置相机距离原点的最远距离
  controls.minDistance = 1
  //设置相机距离原点的最远距离
  controls.maxDistance = 200
  //是否开启右键拖拽
  controls.enablePan = false

  return { controls }
}

// 辉光
function initBloomPass(scene, camera, renderer, composer) {
  // 辉光
  const params = {
    exposure: 0.5,
    bloomStrength: 1,
    bloomThreshold: 0,
    bloomRadius: 0.8
  }
  const renderScene = new RenderPass(scene, camera)
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.2, 0)
  bloomPass.threshold = params.bloomThreshold
  bloomPass.strength = params.bloomStrength
  bloomPass.radius = params.bloomRadius

  composer = new EffectComposer(renderer)
  // console.log(composer)
  const copyShader = new ShaderPass(CopyShader)
  copyShader.renderToScreen = true
  composer.addPass(renderScene)
  composer.addPass(bloomPass)
  composer.addPass(copyShader)

  // 辉光 end
}

// FPS显示
function initStats() {
  const stats = new Stats()
  document.body.appendChild(stats.dom)
  return { stats }
}
const clock = new THREE.Clock()
let scale = 1
let Triangles = [],
  TriangleGroup
function animate(stats, controls, analyser, barGroup, gui, barNodes, composer) {
  stats.update()
  controls.update()

  if (analyser) {
    // 获得频率数据N个
    let arr = analyser.getFrequencyData()
    if (barGroup) {
      barGroup.rotation.z += 0.002
      barGroup.scale.set(scale, scale, scale)
      barGroup.children.forEach((elem, index) => {
        if (gui.R) {
          elem.children[0].material.color.r = arr[index] / (gui.R * 3)
        }
        if (gui.G) {
          elem.children[0].material.color.g = arr[index] / (gui.G * 3)
        }
        if (gui.B) {
          elem.children[0].material.color.b = arr[index] / (gui.B * 3)
        }
        if (arr[index] === 0) {
          elem.scale.set(0, 0, 0)
        } else {
          let m = arr[index] / 20
          let targetRange = Math.max(arr[index] / 20 - arr[index - 1] / 20, 0)
          if (m < targetRange) {
            m = targetRange
          }

          elem.scale.set(1, m, 1)
        }
      })
    }
    const Delta = clock.getDelta()
    barNodes.forEach((node, index, array) => {
      node.strength(arr[index % array.length] * 0.1)
      node.transition(Delta)
    })
    scale = 1 + arr[Math.ceil(arr.length * 0.05)] / 500
    updateCircle(arr)
    Triangles.forEach((triangle) => triangle.transition(Delta))
  }

  // renderer.render(scene, camera);
  composer.render()
  requestAnimationFrame(animate)
}

function addTriangle(gui) {
  const material = new THREE.MeshBasicMaterial({
    color: gui.TrianglesBgColor
  })
  const lineMaterial = new THREE.LineBasicMaterial({
    color: gui.TrianglesLineColor
  })
  // const point = Triangles.length;
  const triangle = makeTriangle(material, lineMaterial, (t) => {
    Triangles = Triangles.filter((triangle) => {
      return triangle !== t
    })
    TriangleGroup.remove(t.group)
  })
  TriangleGroup.add(triangle.group)

  Triangles.push(triangle)
}

// 自适应屏幕
function onWindowResize(camera, renderer, composer) {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  composer.setSize(window.innerWidth, window.innerHeight)
}

// 音频柱子
function audioBars(radius, countData, barGroup, scene) {
  barGroup = new THREE.Group()
  let R = radius
  let N = countData
  for (let i = 0; i < N; i++) {
    let minGroup = new THREE.Group()
    let box = new THREE.BoxGeometry(1, 1, 1)
    let material = new THREE.MeshPhongMaterial({
      color: 0x00ffff
    }) // 材质对象
    let m = i
    let mesh = new THREE.Mesh(box, material)

    mesh.position.y = 0.5
    minGroup.add(mesh)
    minGroup.position.set(Math.sin(((m * Math.PI) / N) * 2) * R, Math.cos(((m * Math.PI) / N) * 2) * R, 0)
    minGroup.rotation.z = ((-m * Math.PI) / N) * 2
    barGroup.add(minGroup)
  }
  scene.add(barGroup)
}

function makeTriangle(material, lineMaterial, t) {
  const triangle = new Triangle(
    2,
    new THREE.Vector3(0, 0, 0),
    Math.random() * 360,
    randomRange(5, 1),
    randomRange(0.1, 0.05),
    material,
    lineMaterial,
    {
      startShow: 15,
      endShow: 30,
      startHide: 60,
      endHide: 70
    },
    t
  )
  return triangle
}

// 音频线
function audioLines(radius, countData, barNodes, barLine, gui, outLine, scene) {
  barNodes = range(0, countData).map((index) => {
    return new node(radius, ((index / countData) * 360 + 45) % 360, new THREE.Vector2(0, 0))
  })
  const lineMaterial = new THREE.LineBasicMaterial({
    color: gui.lineColor
  })
  barLine = range(0, countData).map((index) => {
    return new THREE.Line(
      new THREE.BufferGeometry().setAttribute('position', this.renderGeometries([barNodes[index].positionA(), barNodes[index].positionB()])),
      lineMaterial
    )
  })
  outLine = new THREE.Line(new THREE.BufferGeometry().setAttribute('position', this.renderGeometries(barNodes.map((node) => node.positionA()))), lineMaterial)

  const inLine = new THREE.Line(
    new THREE.BufferGeometry().setAttribute('position', this.renderGeometries(barNodes.map((node) => node.positionB()))),
    lineMaterial
  )

  const linesGroup = new THREE.Group()
  linesGroup.add(outLine)
  linesGroup.add(inLine)
  barLine.forEach((line) => linesGroup.add(line))
  scene.add(linesGroup)
}

function updateCircle(barNodes, linesGroup, outLine, inLine, barLine) {
  if (barNodes) {
    linesGroup.scale.set(this.scale, this.scale, this.scale)
    const geometryA = outLine.geometry
    const AttributeA = geometryA.getAttribute('position')
    const geometryB = inLine.geometry
    const AttributeB = geometryB.getAttribute('position')

    const positions = barNodes.map((value) => {
      return [value.positionA(), value.positionB()]
    })
    positions.forEach((position, index) => {
      AttributeA.set([position[0].x, position[0].y], index * 3)
      AttributeB.set([position[1].x, position[1].y], index * 3)
      const geometry = barLine[index].geometry
      const Attribute = geometry.getAttribute('position')
      Attribute.set([position[0].x, position[0].y, 0, position[1].x, position[1].y, 0], 0)
      Attribute.needsUpdate = true
    })
    AttributeA.set([AttributeA.array[0], AttributeA.array[1]], positions.length * 3)
    AttributeB.set([AttributeB.array[0], AttributeB.array[1]], positions.length * 3)
    AttributeA.needsUpdate = true
    AttributeB.needsUpdate = true
  }
}
function App() {
  const positionZ = 80
  const { renderer, scene, camera, TriangleGroup, controls, stats, composer, listener, audio } = init()
  const audioUrl = '/audio.mp3'

  return <div className="App"></div>
}

export default App
