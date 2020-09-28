
# 音频可视化的实现

主要通过`threejs`以及`Web Audio` 的接口来实现声音可视化的,`Web Audio`允许你在浏览器端操作音频,`threejs`官方解释是一个让创建WebGL应用变得简单的`javascript 3D`库。
页面框架使用了`react`，将音乐可视化、进度条等组件化，开发过程使用了`webpack`构建工具.

### 主要实现的功能有

- 音乐可视化
- 进度条和时间进度显示
- 上传音频文件播放
- 暂停和播放
- 窗口震颤效果
- 动态背景

### 后期的feature

- 通过接口获取音频
- 进度条拖拽
- 背景更换，或者自动切换等等
...


### 主要流程如下

- 构建一个`threejs`场景，并添加一些元素进去,
- 获取声音文件信息,
- 将音频信息解析并渲染到视图上,
- 同步音频播放进度,
- 视窗缩放，实现震颤效果


## 构建一个threejs场景

创建一个3d场景并能让其看到需要下面三个最主要的元素：

- 场景
- 相机
- 渲染器

```js
function sceneInit(){
    // 场景
    this.scene = new THREE.Scene()
    // 相机
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 12000)
    // 渲染器
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    // 画布输出
    this.canvas.current.appendChild(this.renderer.domElement)
}

```

3d场景创建好之后，我们就能在里面加入3d音频柱和音频线



## 读取音频信息内容

我们先初始化一个音频容器和一个监听器

```js

this.listener = new THREE.AudioListener() // 监听者
this.audio = new THREE.Audio(this.listener) // 非位置音频对象

```

这里我们可以通过上传音频文件，通过`FileReader`读取了音频文件,获取其`Data URI`
也可以使用预设的音频

```js
// 预设音频
const audio = require('./assets/DAOKO,米津玄師 - 打上花火.mp3')

```

`threejs`使用`AudioLoader`音频加载器来加载音频文件,其内部默认使用`FileLoader`来加载的。`AudioLoader`接受url — 文件的URL或者路径，也可以为 `Data URI`来获取文件，在文件加载成功后会执行 `onLoad` 回调，我们在该回调中，设置`audio`对的属性，包括音量，是否循环，是否播放等。这里我们使用了Promise来执行异步加载后的操作，同时暴露出`loaded`接口，告知音频加载完毕

## 解析音频信息

音频文件信息获取之后，我们就需要解析音频，这里是用了`threejs`的`AudioAnalyser( audio, fftSize)`,使用`AnalyserNode`去分析音频数据

`fftSize`属性`AnalyserNode`是一个无符号的long值，它表示样本中的窗口大小，该大小在执行快速傅里叶变换（FFT）以获取频域数据时使用。
数值越高，将导致频域中有更多的细节，但是在时域中的细节将减少
这里我们设置了256*2

`AudioAnalyser`有两个重要的方法

- `getFrequencyData`
  当前频率数据复制到`Uint8Array`传递给它的（无符号字节数组）中。
  频率数据由0到255范围内的整数组成。数组中的每个项目代表特定频率的分贝值。频率从采样率的0到1/2线性扩展。例如，对于48000采样率，数组的最后一项将代表24000Hz 的分贝值。
- `getAverageFrequency`
  通过方法`getFrequencyData`获取平均频率.

```js

// 音频分析器和音频绑定，可以实时采集音频时域数据进行快速傅里叶变换
this.analyser = new THREE.AudioAnalyser(audio, this.state.N * 2)

```

在分析完成后就是进行绘制了,使用`requestAnimationFrame`递归重复绘制形成可视化的音频频率,通过`getFrequencyData`方法获取到的频率数组绘制音频柱和音频线
`getAverageFrequency`方法来设置`canvas`的缩放，实现震颤效果
通过渲染器`renderer.render` 渲染到视图中


## 同步音频播放进度

在`requestAnimationFrame`绘制阶段，读取当前播放进度，暴露`onPlaying`接口返回播放进度，父组件通过`setState`设置进度渲染到页面上。进度条封装成一个完全受控组件，将逻辑与视图分离。

## 为了视觉效果更棒

在可视化背景上添加了动态视频

## 结尾的一些说明

`requestAnimationFrame` 为了兼容，使用了`raf`的包；
React 分别使用了Hook 和Class组件，hook可以很好的抽离业务代码，但同时管理复杂的状态表示很混乱,复杂组件会变的难以理解；
Class组件由于其语法的臃肿，使得在小组件上显得赘余，但是在大型组件上却有这天生的优势，更清晰的生命周期和状态管理；