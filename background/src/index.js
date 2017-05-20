import {applyMiddleware, createStore} from 'redux'
import createSagaMiddleware from 'redux-saga'
import {wrapStore} from 'react-chrome-redux'
import rootReducer, {initialState} from './ducks'
import rootSaga from './sagas'
import {fetchRestaurants} from './ducks/restaurants'
import {fetchUsers} from './ducks/users'

const sagaMiddleware = createSagaMiddleware()
const middleware = [sagaMiddleware]

const store = createStore(
  rootReducer,
  initialState,
  applyMiddleware(...middleware)
)

wrapStore(store, {
  portName: 'lounasjuna'
})

sagaMiddleware.run(rootSaga)

store.dispatch(fetchUsers())
store.dispatch(fetchRestaurants())

// message from content page when loaded to activate popup
chrome.runtime.onMessage.addListener(request => {
  if (request.action === 'SHOW_POPUP') {
    console.log(request.action)
    chrome.tabs.query({active: true, currentWindow: true}, tabs => {
      chrome.pageAction.show(tabs[0].id)
    })
  }
})

/*

could use this webRequest api (must be background not event page) and use the url from the
headers to get the same data? Do I need it?

chrome.webRequest.onBeforeRequest.addListener(
  function(info) {
    console.log(info)
  },
// filters
  {
    urls: ["https://www.lounaat.info/ajax/map*"],
    types: ["xmlhttprequest"],
  },
)

*/
