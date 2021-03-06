/*
 * @Author: Agan
 * @Date: 2020-09-22 00:40:34
 * @LastEditors: Agan
 * @LastEditTime: 2020-09-26 22:58:06
 * @Description:
 */
import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './views/app'
import * as serviceWorker from './serviceWorker'

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
