import {takeLatest, takeEvery} from 'redux-saga';
import {call, select, fork, put} from 'redux-saga/effects';
import {SERVER_TIMESTAMP} from '../firebase';
import actions from '../../../shared/actions';
import {set, get, update, remove} from './helpers';
import {reduce, keys, compose, has, prop, propOr, assoc, dissoc} from 'Ramda';
import {sync, CHILD_ADDED, CHILD_REMOVED, CHILD_CHANGED} from './helpers';

// action creators

export const fetchRestaurants = () => ({type: actions.FETCH_RESTAURANTS});
const setRestaurants = restaurants => ({
  type: actions.SET_RESTAURANTS,
  payload: {restaurants},
});
const revokeVotes = userId => ({type: actions.REVOKE_VOTES, payload: {userId}})
const updateRestaurant = payload => ({type: actions.UPDATE_RESTAURANT, payload})
const removeRestaurant = payload => ({type: actions.REMOVE_RESTAURANT, payload})

// selectors

const isRegisteredRestaurant = id => compose(has(id), prop('restaurants'))

const filterRestaurantsByUserId = id => state => {
  const restaurants = prop('restaurants', state)
  return reduce((rests, key) => {
    const containsId = compose(has(id), propOr({}, 'currentVotes'))(restaurants[key])
    return containsId ? rests.concat(restaurants[key]) : rests
  }, [], keys(restaurants))
}

// sagas

function* syncRestaurants() {
  yield fork(sync, 'restaurants', {
    [CHILD_ADDED]: updateRestaurant,
    [CHILD_REMOVED]: removeRestaurant,
    [CHILD_CHANGED]: updateRestaurant
  })
}

export function* vote({payload}) {
  try {
    const {userId, restaurantId, name} = payload;
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
          totalVote: 0,
          insertedAt: SERVER_TIMESTAMP,
          currentVotes: {[userId]: SERVER_TIMESTAMP},
        }
      );
    } else {
      yield call(
        update,
        'votes',
        {restaurantId},
        {[userId]: SERVER_TIMESTAMP}
      );
    }
  } catch (error) {
    console.log('Error voting: ', error);
  }
}


export function* watchVotes() {
  yield call(takeEvery, actions.VOTE, vote);
}

export function* revoke({payload: {userId}}) {
  try {
    const restaurantsWithUserId = yield select(filterRestaurantsByUserId(userId))

    yield restaurantsWithUserId.map(restaurant =>
      call(remove, 'votes', {restaurantId: restaurant.id, userId})
    )
  } catch (error) {
    console.log('Error voting: ', error);
  }
}


export function* watchRevocations() {
  yield call(takeEvery, actions.REVOKE_VOTES, revoke)
}

export function* watchRestaurants() {
  yield call(
    takeLatest,
    actions.FETCH_RESTAURANTS,
    get,
    'restaurants',
    {},
    setRestaurants
  );
}

export const sagas = [watchRestaurants(), watchVotes(), syncRestaurants(), watchRevocations()];

export default (restaurants = {}, action) => {
  switch (action.type) {
    case actions.SET_RESTAURANTS:
      return {
        ...restaurants,
        ...action.payload.restaurants,
      };
    case actions.UPDATE_RESTAURANT:
      return assoc(action.payload.id, action.payload, restaurants)
    case actions.REMOVE_RESTAURANT:
      return dissoc(action.payload.id, restaurants)
    default:
      return restaurants;
  }
};
