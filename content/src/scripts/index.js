import React from 'react'
import {render, unmountComponentAtNode} from 'react-dom'
import {Provider} from 'react-redux'
import {Store} from 'react-chrome-redux'

import Chooser from './Chooser'

const proxyStore = new Store({portName: 'lounasjuna'})

const createId = item => item.replace(/\s+/g, '-').toLowerCase()

const h3s = document.querySelectorAll('h3')
const rests = [...h3s].filter(rest => rest.offsetParent.classList.contains('menu'))
const restaurants = rests.map(title => {
  return {id: createId(title.innerText), name: title.innerText}
})
rests.forEach(title => title.setAttribute('id', createId(title.innerText)))

class ItemRenderer {
  constructor(restaurant) {
    this._container = document.getElementById(restaurant.id)
    this._id = restaurant.id
    this._name = restaurant.name
  }
  render() {
    render(
      <Provider store={proxyStore}>
        <Chooser id={this._id} name={this._name} />
      </Provider>,
      this._container
    );
  }
  destroy() {
    unmountComponentAtNode(this._container)
  }
}

restaurants.forEach(rest => new ItemRenderer(rest).render())