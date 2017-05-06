import {DB} from '../firebase'
import {call, put} from 'redux-saga/effects'

export function* get(path, params, action) {
  const ref = DB[path](params);
  const data = yield call([ref, ref.once], 'value');
  yield put(action(data.val()))
}

export function* set(path, params, payload, action) {
  const ref = DB[path](params)
  const data = yield call([ref, ref.set], payload)
  if (action) {
    yield put(action())
  }
}