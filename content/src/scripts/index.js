import React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import {Store} from 'react-chrome-redux'

import App from './App'

const proxyStore = new Store({portName: 'lounasjuna'})

render(
  <Provider store={proxyStore}>
    <App/>
  </Provider>,
  document.querySelector('.item-container')
)

document.addEventListener('DOMContentLoaded', function () {
  console.log("loaded")
})

