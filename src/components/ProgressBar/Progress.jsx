import React, { useRef } from 'react'
import { secondsFormat } from '../_until'
const Progress = props => {
  const progressBar = useRef()
  const { progress, total } = props
  return (
    <>
      <div className="progress-wrapper">
        <div className="progress-bar">
          <div className="progress-bar__body" ref={progressBar}>
            <div
              className="progress-line"
              style={{ transform: `scaleX(${progress / total})` }}
            ></div>
            <div
              className="progress-control"
              style={{
                transform: `translateX(${
                  (progress * (progressBar.current ? progressBar.current.offsetWidth : 0)) / total
                }px)`
              }}
            >
              <img className="svg" src={require('@/assets/c.svg')} alt="" />
            </div>
          </div>
          <div className="progress-times">
            <span className="progress-loaded">{secondsFormat(progress)}</span>
            <i>/</i>
            <span className="progress-total">{secondsFormat(total)}</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default Progress
