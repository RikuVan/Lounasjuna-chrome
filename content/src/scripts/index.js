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

const D = document

const proxyStore = new Store({portName: 'lounasjuna'})

/**
 * creates react app for each restaurant panel
 */

class LounasjunaRenderer {
  constructor (restaurant) {
    console.log(restaurant.hours)
    this._container = D.getElementById(restaurant.id)
    this._id = restaurant.id
    this._name = restaurant.name
    this._hours = restaurant.hours
  }
  render () {
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

const createId = compose(
  replace(/[^0-9a-z&-]/gi, ''),
  replace(/é/gi, 'e'),
  replace(/å/, 'a'),
  replace(/ö/gi, 'o'),
  replace(/ä/gi, 'a'),
  replace(/\s+|_/g, '-'),
  toLower
)

const getLunch = panel => panel.querySelector('p.lunch').innerText
const getHasLunch = compose(not, equals('ei lounasta'), getLunch)
const normalize = time => (time.length <= 2 ? `${time}:00` : time)

// these are used to create the time picker options for selecting a lunch place and time
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
  // tell background to relay message to popup to activate
  chrome.runtime.sendMessage({action: 'SHOW_POPUP'})

  const panels = [...D.querySelectorAll('div.menu.item')]

  // filter out restaurant panels which already have a lounasjuna or don't offer lunch
  const newPanels = panels.filter(panel => {
    // or better to just check if child ul hasAttribute('id')?
    const restaurantId = createId(panel.querySelector('h3').innerText)
    const hasLunch = getHasLunch(panel)
    return !D.getElementById(restaurantId) && hasLunch
  })

  // lounasjuna app is inserted above the menu lis
  // the parent li is given a unique id formed from the restaurant name
  const items = newPanels.map(panel => {
    const list = panel.querySelector('.item-body > ul')
    const name = panel.querySelector('h3').innerText
    const id = createId(name)
    const listItem = D.createElement('li')
    const hours = getLunchHours(panel)
    listItem.classList.add('menu-item', 'lj-voting')
    listItem.setAttribute('id', id)
    list.insertBefore(listItem, list.childNodes[0])
    return {id, name, hours}
  })

  // create an react app for each restaurant panel
  items.forEach(panel => new LounasjunaRenderer(panel).render())

  // the masonry layout needs to be adjusted after inserting the the react components
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
