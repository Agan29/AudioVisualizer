/*
 * @Author: Agan
 * @Date: 2020-09-22 00:40:34
 * @LastEditors: Agan
 * @LastEditTime: 2020-09-26 22:59:15
 * @Description:
 */
import React, { useState, useCallback } from 'react'
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

  const title = ' tezt'
  const progressOptions = {
    progress,
    total
  }
  return (
    <div className="App">
      <div className="title">{title}</div>
      <div className={`play ${play ? 'to-pause' : 'to-play'}`} onClick={handlePlay}></div>

      <Progress {...progressOptions} />

      <AudioVisualizer
        onLoading={onLoading}
        loaded={loaded}
        play={play}
        onPlaying={listeners}
        showGui={false}
        showStats={false}
        bg={videoBg}
        audioUrl=""
      />
    </div>
  )
}

export default App
