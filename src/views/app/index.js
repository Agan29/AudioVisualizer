/*
 * @Author: Agan
 * @Date: 2020-09-22 00:40:34
 * @LastEditors: Agan
 * @LastEditTime: 2020-09-29 00:32:28
 * @Description:
 */
import React, { useState, useCallback, useRef, useEffect } from 'react'
import AudioVisualizer from '@/components/AudioVisualizer'
import Progress from '@/components/ProgressBar'
import './App.less'
const videoBg = (
  <>
    <div className="mask"></div>
    <video src={require('./assets/比那名居天子.mov')} autoPlay loop></video>
  </>
)
function App() {
  // const positionZ = 80
  // const audioUrl = '/audio.mp3'

  const [play, setPlay] = useState(false)
  const [total, setTotal] = useState(0)

  const [progress, setProgress] = useState(0)
  const [title, setTitle] = useState('打上花火')
  const [auidoFile, setAuidoFile] = useState(null)
  const file = useRef()

  const onLoading = useCallback(xhr => {
    console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
  }, [])
  const loaded = useCallback(
    audio => {
      console.log(audio)
      setTotal(audio.buffer.duration)
    },
    [setTotal]
  )

  const handlePlay = useCallback(() => {
    setPlay(!play)
  }, [setPlay, play])
  const listeners = useCallback(
    progress => {
      setProgress(progress)
    },
    [setProgress]
  )
  // 获取文件
  const getFile = () => {
    const { files } = file.current

    if (files.length > 0) {
      setTitle(files[0].name.replace(/\.\w+/, ''))
      setAuidoFile(files[0])
      setProgress(0)
    }
  }

  const progressOptions = {
    progress,
    total
  }
  const audio = require('./assets/DAOKO,米津玄師 - 打上花火.mp3')
  return (
    <div className="App">
      <div className="title">{title}</div>
      <div className={`play ${play ? 'to-pause' : 'to-play'}`} onClick={handlePlay}></div>
      {play ? null : (
        <div className="fileUpload" style={{ display: 'block' }}>
          <input type="file" onChange={getFile} ref={file} />
          <span>上传文件</span>
        </div>
      )}

      <Progress {...progressOptions} />

      <AudioVisualizer
        onLoading={onLoading}
        loaded={loaded}
        play={play}
        onPlaying={listeners}
        showGui={false}
        showStats={false}
        bg={videoBg}
        preinstall={audio}
        file={auidoFile}
      />
    </div>
  )
}

export default App
