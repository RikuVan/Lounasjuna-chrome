import {put, call, takeEvery} from 'redux-saga/effects'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

function* incrementAsync () {
  yield call(delay, 1000)
  yield put({type: 'INCREMENT'})
}

function* watchCount () {
  yield takeEvery('ADD_COUNT', incrementAsync)
}

export const initialCountState = 0

export default (state = initialState, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return state + (action.payload || 1)
    default:
      return state
  }
}

export const sagas = [watchCount()]
