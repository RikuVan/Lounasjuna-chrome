import {takeLatest, takeEvery} from 'redux-saga'
import {call, select, fork, put} from 'redux-saga/effects'
import {SERVER_TIMESTAMP} from '../firebase'
import actions, {revokeVotes} from '../../../shared/actions'
import {
  CHILD_ADDED,
  CHILD_REMOVED,
  CHILD_CHANGED,
  sync,
  set,
  get,
  update,
  remove
} from './helpers'
import {
  reduce,
  keys,
  compose,
  has,
  prop,
  propOr,
  assoc,
  assocPath,
  dissoc,
  merge
} from 'Ramda'

// action creators

export const fetchRestaurants = () => ({type: actions.FETCH_RESTAURANTS})
const setRestaurants = restaurants => ({
  type: actions.SET_RESTAURANTS,
  payload: {restaurants}
})
const updateRestaurant = payload => ({type: actions.UPDATE_RESTAURANT, payload})
const removeRestaurant = payload => ({type: actions.REMOVE_RESTAURANT, payload})

// selectors

const isRegisteredRestaurant = id => compose(has(id), prop('restaurants'))

const filterRestaurantsByUserId = id => state => {
  const restaurants = prop('restaurants', state)
  return reduce(
    (rests, key) => {
      const containsId = compose(has(id), propOr({}, 'currentVotes'))(
        restaurants[key]
      )
      return containsId ? rests.concat(restaurants[key]) : rests
    },
    [],
    keys(restaurants)
  )
}

// sagas

function* syncRestaurants () {
  yield fork(sync, 'restaurants', {
    [CHILD_ADDED]: updateRestaurant,
    [CHILD_REMOVED]: removeRestaurant,
    [CHILD_CHANGED]: updateRestaurant
  })
}

export function* vote ({payload}) {
  try {
    const {userId, restaurantId, name, timestamp} = payload
    yield put(revokeVotes(userId))
    const inDb = yield select(isRegisteredRestaurant(restaurantId))
    if (!inDb) {
      yield call(
        set,
        'restaurants',
        {restaurantId},
        {
          id: restaurantId,
          name,
          insertedAt: SERVER_TIMESTAMP,
          currentVotes: {[userId]: timestamp}
        }
      )
    } else {
      yield call(update, 'votes', {restaurantId}, {[userId]: timestamp})
    }
  } catch (error) {
    console.log('Error voting: ', error)
  }
}

export function* watchVotes () {
  yield call(takeEvery, actions.VOTE, vote)
}

export function* revoke ({payload: {userId}}) {
  try {
    const restaurantsWithUserId = yield select(
      filterRestaurantsByUserId(userId)
    )

    yield restaurantsWithUserId.map(restaurant =>
      call(remove, 'votes', {restaurantId: restaurant.id, userId})
    )
  } catch (error) {
    console.log('Error voting: ', error)
  }
}

export function* watchRevocations () {
  yield call(takeEvery, actions.REVOKE_VOTES, revoke)
}

export function* watchRestaurants () {
  yield call(
    takeLatest,
    actions.FETCH_RESTAURANTS,
    get,
    'restaurants',
    {},
    setRestaurants
  )
}

export const sagas = [
  watchRestaurants(),
  watchVotes(),
  syncRestaurants(),
  watchRevocations()
]

const assocMerge = (id, newObj, state) => {
  const updated = merge(propOr({}, id, state), newObj)
  return assoc(id, newObj, state)
}

export default (restaurants = {}, action) => {
  switch (action.type) {
    case actions.SET_RESTAURANTS:
      return merge(restaurants, action.payload.restaurants)
    case actions.UPDATE_RESTAURANT:
      return assocMerge(action.payload.id, action.payload, restaurants)
    case actions.REMOVE_RESTAURANT:
      return dissoc(action.payload.id, restaurants)
    case actions.SET_LUNCH_TIME:
      return assocPath([action.payload.id, 'time'], action.payload.time, restaurants)
    default:
      return restaurants
  }
}
