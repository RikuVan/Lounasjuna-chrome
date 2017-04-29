import React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import {Store} from 'react-chrome-redux'

import App from './App'

const proxyStore = new Store({portName: 'example'})

const anchor = document.createElement('div')
anchor.id = 'lj-anchor';

document.body.insertBefore(anchor, document.body.childNodes[0])

render(
  <Provider store={proxyStore}>
    <App/>
  </Provider>,
  document.getElementById('lj-anchor')
)