/*
 * @Author: Agan
 * @Date: 2020-09-24 00:44:01
 * @LastEditors: Agan
 * @LastEditTime: 2020-09-26 22:36:58
 * @Description:
 */
import React, { Component, PureComponent } from 'react'
import * as THREE from 'three'
import * as dat from 'dat.gui'
import raf from 'raf'
import Stats from 'stats-js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { RenderPass } from '@/lib/RenderPass'
import { UnrealBloomPass } from '@/lib/UnrealBloomPass'
import { EffectComposer } from '@/lib/EffectComposer'
import { ShaderPass } from '@/lib/ShaderPass'
import { CopyShader } from '@/lib/CopyShader'
import { range } from '@/components/range'
import { node } from '@/components/node'
import { randomRange } from '@/components/randomRange'
import { Triangle } from '@/components/Triangle'

let Triangles = [],
  TriangleGroup
class AudioVisualizer extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      positionZ: 52,
      N: 256,
      scale: 1
    }
    this.camera = null
    this.clock = new THREE.Clock()
    this.play = false
    this.scale = 1
    this.gui = {
      R: 20,
      G: 90,
      B: 225,
      TrianglesBgColor: 0x03a9f4,
      TrianglesLineColor: 0x03a9f4,
      lineColor: 0x00ffff,
      rotate: false
    }
    this.barLine = []
    this.canvas = React.createRef()

    this.animate = this.animate.bind(this)
    this.onWindowResize = this.onWindowResize.bind(this)
  }
  componentDidMount() {
    this.parentNode = this.canvas.current.parentNode
    this.sceneInit()
    this.initAudio()
    this.initLight()
    // todo：暂停，控制视图不能更新问题
    // this.initControls()

    this.initBloomPass()

    const { showGui, showStats } = this.props
    // gui 选择器
    showGui && this.initGui()
    // fps
    showStats && this.initStats()

    window.addEventListener('resize', this.onWindowResize, false)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.play !== this.props.play) {
      this.play = this.props.play

      if (!this.props.play) {
        this.audio.pause()
      } else {
        this.audio.setPlaybackRate(1)

        this.audio.play()

        this.animate()
      }
    }
  }

  // 初始化
  sceneInit() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setClearAlpha(0)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    // 或者renderer.setClearAlpha(0.0);它的意思是每次绘制清除缓冲区后的颜色通道设置，简单就是设置每次绘制的背景颜色
    this.renderer.setClearColor(0xffffff, 0)
    // const app = document.getElementById('root')
    this.canvas.current.appendChild(this.renderer.domElement)
    this.scene = new THREE.Scene()
    // this.scene.background = new THREE.Color(0xff0000)
    // this.renderer.setClearAlpha(0.0)
    // this.scene.background = new THREE.TextureLoader().load(require('@/assets/bg2.jpg'));
    // {
    // this.scene.background = new THREE.CubeTextureLoader().load([
    //   // require('@/assets/skybox/right.jpg'),
    //   // require('@/assets/skybox/left.jpg'),
    //   // require('@/assets/skybox/top.jpg'),
    //   // require('@/assets/skybox/bottom.jpg'),
    //   // require('@/assets/skybox/front.jpg'),
    //   // require('@/assets/skybox/back.jpg'
    // ])
    // }

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 12000)
    this.camera.position.z = this.state.positionZ

    this.audioLines(20, this.state.N)
    this.audioBars(25, this.state.N / 2) // 添加音频柱子

    TriangleGroup = new THREE.Group()

    setInterval(this.addTriangle.bind(this), 500)
    this.scene.add(TriangleGroup)
  }
  initAudio() {
    // 加载音频 start
    this.listener = new THREE.AudioListener() // 监听者
    this.audio = new THREE.Audio(this.listener) // 非位置音频对象
    let audioUrl = this.props.audioUrl || require('@/assets/audio.mp3')

    this.audioLoad(audioUrl).then(audio => {
      // 音频分析器和音频绑定，可以实时采集音频时域数据进行快速傅里叶变换
      this.analyser = new THREE.AudioAnalyser(audio, this.state.N * 2)
      this.animate()
    })

    // 加载音频 end
  }
  updateCircle() {
    const { state, outLine, inLine, barNodes, barLine } = this
    if (barNodes) {
      this.linesGroup.scale.set(state.scale, state.scale, state.scale)
      const geometryA = outLine.geometry
      const AttributeA = geometryA.getAttribute('position')
      const geometryB = inLine.geometry
      const AttributeB = geometryB.getAttribute('position')

      const positions = barNodes.map(value => {
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
  addTriangle() {
    const { gui } = this
    const material = new THREE.MeshBasicMaterial({
      color: gui.TrianglesBgColor
    })
    const lineMaterial = new THREE.LineBasicMaterial({
      color: gui.TrianglesLineColor
    })
    // const point = this.Triangles.length;
    const triangle = this.makeTriangle(material, lineMaterial, t => {
      Triangles = Triangles.filter(triangle => {
        return triangle !== t
      })
      TriangleGroup.remove(t.group)
    })
    TriangleGroup.add(triangle.group)

    Triangles.push(triangle)
  }
  makeTriangle(material, lineMaterial, t) {
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
  // 音频柱子
  audioBars(radius, countData) {
    this.barGroup = new THREE.Group()
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
      minGroup.position.set(
        Math.sin(((m * Math.PI) / N) * 2) * R,
        Math.cos(((m * Math.PI) / N) * 2) * R,
        0
      )
      minGroup.rotation.z = ((-m * Math.PI) / N) * 2
      this.barGroup.add(minGroup)
    }
    this.scene.add(this.barGroup)
  }
  renderGeometries(vertices) {
    const res = []
    vertices = vertices.concat(vertices[0])
    vertices.forEach(value => {
      res.push(value.x, value.y, 0)
    })
    return new THREE.BufferAttribute(new Float32Array(res), 3)
  }
  // 音频线
  audioLines(radius, countData) {
    this.barNodes = range(0, countData).map(index => {
      return new node(radius, ((index / countData) * 360 + 45) % 360, new THREE.Vector2(0, 0))
    })
    const lineMaterial = new THREE.LineBasicMaterial({
      color: this.gui.lineColor
    })
    const { barNodes } = this
    this.barLine = range(0, countData).map(index => {
      return new THREE.Line(
        new THREE.BufferGeometry().setAttribute(
          'position',
          this.renderGeometries([barNodes[index].positionA(), barNodes[index].positionB()])
        ),
        lineMaterial
      )
    })
    this.outLine = new THREE.Line(
      new THREE.BufferGeometry().setAttribute(
        'position',
        this.renderGeometries(barNodes.map(node => node.positionA()))
      ),
      lineMaterial
    )

    this.inLine = new THREE.Line(
      new THREE.BufferGeometry().setAttribute(
        'position',
        this.renderGeometries(barNodes.map(node => node.positionB()))
      ),
      lineMaterial
    )

    this.linesGroup = new THREE.Group()
    const { linesGroup } = this
    linesGroup.add(this.outLine)
    linesGroup.add(this.inLine)
    this.barLine.forEach(line => linesGroup.add(line))
    this.scene.add(linesGroup)
  }
  // 辉光
  initBloomPass() {
    // 辉光
    let params = {
      exposure: 0.5,
      bloomStrength: 1,
      bloomThreshold: 0,
      bloomRadius: 0.8
    }
    let renderScene = new RenderPass(this.scene, this.camera)
    let bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,
      0.2,
      0
    )
    bloomPass.threshold = params.bloomThreshold
    bloomPass.strength = params.bloomStrength
    bloomPass.radius = params.bloomRadius

    this.composer = new EffectComposer(this.renderer)
    // console.log(composer)
    const copyShader = new ShaderPass(CopyShader)
    copyShader.renderToScreen = true
    this.composer.addPass(renderScene)
    this.composer.addPass(bloomPass)
    this.composer.addPass(copyShader)

    // 辉光 end
  }
  getAudioProgress(buffProgerss) {
    const { audio } = this
    let progress = audio._progress + buffProgerss
    if (progress > audio.buffer.duration) {
      progress = 0
    }
    // console.log(audio._progress)
    this.props.onPlaying(progress)
  }
  // 动态渲染
  animate() {
    this.stats && this.stats.update()
    // this.controls.update()

    if (this.analyser && this.props.play) {
      const { gui, audio, barGroup } = this
      this.props.onPlaying &&
        this.getAudioProgress(
          Math.max(audio.context.currentTime - audio._startedAt, 0) * audio.playbackRate
        )
      // 获得频率数据N个
      let arr = this.analyser.getFrequencyData()
      let avf = this.analyser.getAverageFrequency() / 1500
      // console.log(this.analyser.getAverageFrequency()`)
      this.canvas.current.setAttribute('style', `transform:scale(${1 + avf})`)
      if (barGroup) {
        barGroup.rotation.z += 0.002
        barGroup.scale.set(this.state.scale, this.state.scale, this.state.scale)
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
      const Delta = this.clock.getDelta()
      this.barNodes.forEach((node, index, array) => {
        node.strength(arr[index % array.length] * 0.1)
        node.transition(Delta)
      })
      this.scale = 1 + arr[Math.ceil(arr.length * 0.05)] / 500

      this.updateCircle(arr)
      Triangles.forEach(triangle => triangle.transition(Delta))
    }

    // renderer.render(scene, camera);
    this.composer.render()
    this.props.play && raf(this.animate)
  }
  // 自适应屏幕
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.composer.setSize(window.innerWidth, window.innerHeight)
    this.composer.render()
  }
  // 鼠标控制
  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    // 如果使用animate方法时，将此函数删除
    this.controls.addEventListener('change', this.composer.render)
    // 使动画循环使用时阻尼或自转 意思是否有惯性
    this.controls.enableDamping = true
    //动态阻尼系数 就是鼠标拖拽旋转灵敏度
    //this.controls.dampingFactor = 0.25;
    //是否可以缩放
    this.controls.enableZoom = true
    //是否自动旋转
    this.controls.autoRotate = this.gui.rotate
    //设置相机距离原点的最远距离
    this.controls.minDistance = 1
    //设置相机距离原点的最远距离
    this.controls.maxDistance = 200
    //是否开启右键拖拽
    this.controls.enablePan = false
  }
  // FPS显示
  initStats() {
    this.stats = new Stats()
    document.body.appendChild(this.stats.dom)
  }
  // GUI控制显示
  initGui() {
    const { gui, controls, linesGroup } = this
    //声明一个保存需求修改的相关数据的对象
    let datGui = new dat.GUI()
    //将设置属性添加到gui当中，gui.add(对象，属性，最小值，最大值）
    datGui.add(gui, 'R', 0, 255)
    datGui.add(gui, 'G', 0, 255)
    datGui.add(gui, 'B', 0, 255)
    controls &&
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
  // 环境光和平行光
  initLight() {
    this.scene.add(new THREE.AmbientLight(0x444444))
    let light = new THREE.PointLight(0xffffff)
    light.position.set(80, 100, 50)
    //告诉平行光需要开启阴影投射
    light.castShadow = true
    this.scene.add(light)
  }
  //  音频加载播放
  audioLoad(url) {
    console.log(url)
    const { audio } = this
    let audioLoader = new THREE.AudioLoader() // 音频加载器
    const { onLoading, loaded } = this.props
    return new Promise(resolve => {
      audioLoader.load(
        url,
        AudioBuffer => {
          if (audio.isPlaying) {
            audio.stop()
            audio.setBuffer()
          }
          audio.setBuffer(AudioBuffer) // 音频缓冲区对象关联到音频对象audio
          audio.setLoop(true) //是否循环
          audio.setVolume(1) //音量
          // audio.play() //播放
          resolve(audio)
          loaded && loaded(audio)
        }, // onProgress回调
        xhr => {
          onLoading && onLoading(xhr)
          const set = new Set()

          //   console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        }
      )
    })
  }
  render() {
    console.log('render')
    return (
      <div className="canvas-wrapper" ref={this.canvas}>
        {this.props.bg}
      </div>
    )
  }
}

export default AudioVisualizer
