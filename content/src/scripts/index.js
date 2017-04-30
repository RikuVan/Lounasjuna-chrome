import React from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import {Store} from 'react-chrome-redux'

import Content from './Content'

const proxyStore = new Store({portName: 'lounasjuna'})

render(
  <Provider store={proxyStore}>
    <Content/>
  </Provider>,
  document.querySelector('.item-container')
)
