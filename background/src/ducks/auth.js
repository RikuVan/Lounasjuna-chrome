import {eventChannel, takeEvery, channel} from 'redux-saga'
import {call, put, take, select, fork} from 'redux-saga/effects'
import {auth, getGoogleCredential, signInWithCredential} from '../firebase'
import actions from '../../../shared/actions'
import {addUser} from './users'
import {assoc, compose, has, prop} from 'Ramda'
import {set} from './requests'

// chrome methods

const getToken = chrome.identity.getAuthToken
const removeTokenFromCache = chrome.identity.removeCachedAuthToken

// action creators

export const signIn = user => ({type: actions.SIGN_IN, payload: user})
export const signOut = () => ({type: actions.SIGN_OUT})
export const attemptSignIn = () => ({type: actions.ATTEMPT_SIGN_IN})
export const cancelGoogleAuth = () => ({type: actions.CANCEL_AUTH})

// selectors

const isAmongUsers = uid => compose(
  has(uid),
  prop('auth')
)

// Sagas

// need to wrap in promise for call
const maybeToken = interactive => {
  return new Promise(resolve => {
    return getToken({interactive}, resolve)
  })
}
// TODO: how to get this in a catch with token?
const removeToken = token => {
  return new Promise(resolve => {
    return removeTokenFromCache({token}, resolve)
  })
}

export function* login (interactive) {
  try {
    const token = yield maybeToken(!!interactive)
    console.log(token)
    if (chrome.runtime.lastError && !interactive) {
      console.log('It was not possible to get a token programmatically.')
    } else if (chrome.runtime.lastError) {
      console.error("lastError", chrome.runtime.lastError)
    } else if (token) {
      const credential = yield call(getGoogleCredential, null, token)
      const {uid, displayName, photoURL} = yield call([auth, auth.signInWithCredential], credential)
      if (uid) {
        const registered = yield select(isAmongUsers(uid))
        if (!registered) {
          yield fork(set, 'users', {userId: uid}, {displayName, photoURL})
        }
        yield put(signIn({uid, displayName, photoURL}))

      } else {
        console.error('The OAuth Token was null')
      }
    }
  } catch (error) {
    console.log('login error:', error)
    yield put(signIn({error}))
  }
}

export function* watchLogin () {
  yield call(takeEvery, actions.ATTEMPT_SIGN_IN, login, true)
}

const subscribe = () =>
  eventChannel(emit => auth.onAuthStateChanged(user => emit(user || {})))

function* watchAuthentication () {
  const channel = yield call(subscribe)
  // Keep on taking events from the eventChannel till infinity
  while (true) {
    const {uid, displayName, photoURL} = yield take(channel)
    console.log("auth channel", uid)
    if (uid) {
      try {
        yield put(signIn({uid, displayName, photoURL}))
      } catch (error) {
        console.log('auth error:', error)
      }
    } else {
      yield put(signOut())
    }
  }
}

export function* doCancelAuth () {
  console.log("called")
  try {
    const user = yield call([auth, auth.signOut])
    console.log("HERE", user)
    yield put(signOut())
  } catch (error) {
    console.log('cancel auth error:', error)
  }
}

export function* watchCancel () {
  yield call(takeEvery, actions.CANCEL_AUTH, doCancelAuth)
}

export const sagas = [watchLogin(), watchAuthentication(), watchCancel()]

// Reducer

export const initialAuthState = {
  loading: false,
  uid: null,
  displayName: null
}

export default (user = initialAuthState, action) => {
  console.log(action)
  switch (action.type) {
    case actions.ATTEMPT_SIGN_IN:
      return assoc('loading', true, user)
    case actions.SIGN_IN:
      return {
        ...user,
        ...action.payload
      }
    case actions.SIGN_OUT:
      return initialAuthState
    default:
      return user
  }
}
