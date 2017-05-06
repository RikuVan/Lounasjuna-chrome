import React from 'react'
import {render, unmountComponentAtNode} from 'react-dom'
import {Provider} from 'react-redux'
import {Store} from 'react-chrome-redux'

import Title from './Title'

const proxyStore = new Store({portName: 'lounasjuna'})

const createId = item => item.replace(/\s+/g, '-').toLowerCase()

/**
 * replaces h3 title for restaurant card with react version
 */

class ItemRenderer {
  constructor(restaurant) {
    this._container = document.getElementById(restaurant.id)
    this._id = restaurant.id
    this._name = restaurant.name
    this._path = restaurant.path
  }
  render() {
    render(
      <Provider store={proxyStore}>
        <Title id={this._id} name={this._name} path={this._path} />
      </Provider>,
      this._container
    );
  }
  destroy() {
    unmountComponentAtNode(this._container)
  }
}

const init = () => {
  const h3s = document.querySelectorAll('h3')
  const rests = [...h3s].filter(rest => {
    //make sure we don't replace a react instance with id and filter out any non
    //restaurant title h3s
    return !rest.hasAttribute('id') &&
      rest.offsetParent.classList.contains('menu')
  })
  // copy over title text and href path to use in react version
  const restaurants = rests.map(title => {
    let anchorEl
    const childEl = title.childNodes[0]
    if (childEl.nodeName === 'A') {
      anchorEl = childEl
    } else {
      anchorEl = title.childNodes[0].getElementsByTagName('a')[0]
    }
    const path = anchorEl.getAttribute('href')
    const id = createId(anchorEl.innerText)
    const name = anchorEl.innerText
    return {id, name, path}
  })
  rests.forEach(title => title.setAttribute('id', createId(title.innerText)))
  restaurants.forEach(rest => new ItemRenderer(rest).render())
}

init()

// monitor all links in case a search filter or 'load more' link is clicked and
// we need to reinitialize all the Choosers
const links = [...document.getElementsByTagName('a')]

links.forEach(link => {
  link.onclick = function () {
    //TODO: check that it is the base href or with a hash to reload, otherwise a link to another page
    //we have to make sure somehow all the new dome elements are there
    setTimeout(init, 1000)
  }
})