import React from 'react'
import {render} from 'react-dom'
import {Store} from 'react-chrome-redux'
import {Provider} from 'react-redux'
import '../styles/popup.css'

import Popup from './Popup'

const proxyStore = new Store({
  portName: 'lounasjuna'
})

render(
  <Provider store={proxyStore}>
    <Popup />
  </Provider>,
  document.getElementById('app')
)

