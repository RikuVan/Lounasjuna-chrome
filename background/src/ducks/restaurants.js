import {takeLatest, takeEvery} from 'redux-saga'
import {call, select} from 'redux-saga/effects'
import actions from '../../../shared/actions'
import {set, get, update} from './helpers'
import {compose, has, prop} from 'Ramda'

// action creators

const setRestaurants = restaurants => ({type: actions.SET_RESTAURANTS, payload: {restaurants}})
const addVote = whatever => ({type: actions.ADD_VOTE, payload: {whatever}})

// selectors

const isRegisteredRestaurant = id => compose(has(id), prop('restaurants'))

// sagas

export function* registerVote ({payload}) {
  try {
    const {userId, restaurantId, name} = payload
    const inDb = yield select(isRegisteredRestaurant(restaurantId))
    if (!inDb) {
      yield call(set, 'restaurants', {restaurantId}, {name, totalVote: 0, currentVotes: {[userId]: true}}, addVote)
    } else {
      yield call(update, 'votes', {restaurantId}, {[userId]: true}, addVote)
    }
  } catch (error) {
    console.log("Error voting: ", error)
  }
}

export function* watchVotes () {
  yield call(takeEvery, actions.VOTE, registerVote)
}

export function* watchRestaurants () {
  yield call(takeLatest, actions.FETCH_RESTAURANTS, get, 'restaurants', {}, setRestaurants)
}

export const sagas = [watchRestaurants(), watchVotes()]

export default (restaurants = {}, action) => {
  console.log(action)
  switch (action.type) {
    case actions.SET_RESTAURANTS:
      return {
        ...restaurants,
        ...action.payload.restaurants
      }
    default:
      return restaurants
  }
}