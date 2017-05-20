import React from 'react'
import {render, unmountComponentAtNode} from 'react-dom'
import {Provider} from 'react-redux'
import {Store} from 'react-chrome-redux'
import {
  map,
  trim,
  replace,
  toLower,
  compose,
  split,
  not,
  equals,
  zipObj,
  evolve
} from 'Ramda'

import Restaurant from './Restaurant'

const proxyStore = new Store({portName: 'lounasjuna'})

const createId = compose(
  replace(/[^0-9a-z&-]/gi, ''),
  replace(/é/gi, 'e'),
  replace(/å/, 'a'),
  replace(/ö/gi, 'o'),
  replace(/ä/gi, 'a'),
  replace(/\s+|_/g, '-'),
  toLower
)

const D = document

/**
 * replaces h3 title for restaurant card with react version
 */

class ItemRenderer {
  constructor (restaurant) {
    this._container = D.getElementById(restaurant.id)
    this._id = restaurant.id
    this._name = restaurant.name
    this._hours = restaurant.hours
  }
  render () {
    console.log(this._container)
    render(
      <Provider store={proxyStore}>
        <Restaurant id={this._id} name={this._name} hours={this._hours} />
      </Provider>,
      this._container
    )
  }
  destroy () {
    unmountComponentAtNode(this._container)
  }
}

const getLunch = panel => panel.querySelector('p.lunch').innerText
const getHasLunch = compose(not, equals('ei lounasta'), getLunch)
const normalize = time => (time.length <= 2 ? `${time}:00` : time)
const getLunchHours = compose(
  evolve({
    start: normalize,
    end: normalize
  }),
  zipObj(['start', 'end']),
  map(trim),
  split('-'),
  getLunch
)

const init = () => {
  chrome.runtime.sendMessage({action: 'SHOW_POPUP'})

  const panels = [...D.querySelectorAll('div.menu.item')]

  const newPanels = panels.filter(panel => {
    // or better to just check if child ul hasAttribute('id')?
    const restaurantId = createId(panel.querySelector('h3').innerText)
    const hasLunch = getHasLunch(panel)
    return !D.getElementById(restaurantId) && hasLunch
  })

  const items = newPanels.map(panel => {
    const list = panel.querySelector('.item-body > ul')
    const name = panel.querySelector('h3').innerText
    const id = createId(name)
    const listItem = D.createElement('li')
    const hours = getLunchHours(panel)
    listItem.classList.add('menu-item')
    listItem.setAttribute('id', id)
    list.insertBefore(listItem, list.childNodes[0])
    return {id, name, hours}
  })

  items.forEach(panel => new ItemRenderer(panel).render())

  /*
  const h3s = document.querySelectorAll('h3')
  const rests = [...h3s].filter(rest => {
    // make sure we don't replace a react instance with id and filter out any non
    // restaurant title h3s
    return (
      !rest.hasAttribute('id') && rest.offsetParent.classList.contains('menu')
    )
  }) */

  // copy over title text and href path to use in react version
  /* const restaurants = rests.map(title => {
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
  restaurants.forEach(rest => new ItemRenderer(rest).render()) */
  // adjust isotope layout for larger cards
  setTimeout(() => window.dispatchEvent(new Event('resize')), 30)
}

init()

// monitor all links in case a search filter or 'load more' link is clicked and
// we need to reinitialize all the Choosers
const links = [...document.getElementsByTagName('a')]

links.forEach(link => {
  link.onclick = function () {
    // TODO: check that it is the base href or with a hash to reload, otherwise a link to another page
    // we have to make sure somehow all the new dome elements are there
    setTimeout(init, 1000)
  }
})
