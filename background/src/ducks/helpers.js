import {DB} from '../firebase'
import {eventChannel} from 'redux-saga'
import {call, put, fork, take} from 'redux-saga/effects'

export const CHILD_ADDED = 'child_added'
export const CHILD_REMOVED = 'child_removed'
export const CHILD_CHANGED = 'child_changed'
export const CHILD_MOVED = 'child_moved'
export const VALUE = 'value'

const EVENT_TYPES = [CHILD_ADDED, CHILD_REMOVED, CHILD_CHANGED, CHILD_MOVED, VALUE]

const newOpts = (name = 'data') => {
  const opts = {};
  const chan = eventChannel(emit => {
    opts.handler = obj => {
      emit({ [name]: obj })
    };
    return () => {}
  });

  chan.handler = opts.handler
  return chan
};

export function* get(path, params, action) {
  const ref = DB[path](params);
  const data = yield call([ref, ref.once], 'value')
  yield put(action(data.val()))
}

export function* set(path, params, payload, actionCreator) {
  const ref = DB[path](params)
  const opts = newOpts('data')

  const [_, {error}] = yield [
    call([ref, ref.set], payload, opts.handler),
    take(opts)
  ];

  yield put(actionCreator())

  return error
}

export function* update(path, params, payload, actionCreator = () => {}) {
  const opts = newOpts('error')
  const ref = DB[path](params)

  const [_, {error}] = yield [
    call([ref, ref.update], payload, opts.handler),
    take(opts)
  ];

  yield put(actionCreator())

  return error
}

function* runSync(ref, eventType, actionCreator) {
  const opts = newOpts()
  yield call([ref, ref.on], eventType, opts.handler)

  while (true) {
    const {data} = yield take(opts)
    yield put(actionCreator({...data.val()}))
  }
}

export function* sync(path, mapEventToAction = {}, limit) {
  const ref = typeof limit === 'number' ?
    DB[path]({}).limitToLast(limit) : DB[path]({})

  for (let type of EVENT_TYPES) {
    const action = mapEventToAction[type]

    if (typeof action === 'function') {
      yield fork(runSync, ref, type, action)
    }
  }
}