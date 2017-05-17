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
