/*
 * @Author: Agan
 * @Date: 2020-09-22 00:40:34
 * @LastEditors: Agan
 * @LastEditTime: 2020-09-24 23:42:14
 * @Description:
 */
import React, { useState } from 'react'
import AudioVisualizer from './init'
import './App.less'

function App() {
  const positionZ = 80
  const audioUrl = '/audio.mp3'

  const [play, setPlay] = useState(false)
  const handldeProgress = (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
  }
  const handlePlay = () => {
    setPlay(!play)
  }
  return (
    <div className="App">
      <button onClick={handlePlay}> {play ? '暂停' : '播放'}</button>

      <div className="progress-bar">
        <div className="progress-bar__body">
          <div className="progress-times">
            <span className="progress-loaded"></span>
            <i>/</i>
            <span className="progress-total"></span>
          </div>
          <div className="progress-line">
            <div className="progress-control"></div>
          </div>
        </div>
      </div>
      <AudioVisualizer onProgress={handldeProgress} play={play} />
    </div>
  )
}

export default App
