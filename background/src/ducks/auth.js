import {eventChannel, takeEvery, channel} from 'redux-saga'
import {call, put, take} from 'redux-saga/effects'
import {auth, getGoogleCredential, signInWithCredential} from '../firebase'
import actions from '../../../shared/actions'
import {assoc} from 'Ramda'

// chrome methods

const getToken = chrome.identity.getAuthToken
const removeTokenFromCache = chrome.identity.removeCachedAuthToken

// action creators

export const signIn = user => ({type: actions.SIGN_IN, payload: user})
export const signOut = () => ({type: actions.SIGN_OUT})
export const attemptSignIn = () => ({type: actions.ATTEMPT_SIGN_IN})
export const cancelGoogleAuth = () => ({type: actions.CANCEL_AUTH})

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

export function* authorize (credential) {
  yield call([auth, signInWithCredential], credential)
}

export function* login (interactive) {
  try {
    const token = yield maybeToken(!!interactive)
    if (chrome.runtime.lastError && !interactive) {
      console.log('It was not possible to get a token programmatically.')
    } else if (chrome.runtime.lastError) {
      console.error("lastError", chrome.runtime.lastError)
    } else if (token) {
      const credential = yield call(getGoogleCredential, null, token)
      const {uid, displayName, photoURL} = yield call([auth, signInWithCredential], credential)
      if (uid) {
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
  // takeEvery/takeLatest is an alternative to the "while (true)" pattern
  yield call(takeEvery, actions.ATTEMPT_SIGN_IN, login, true)
}

const subscribe = () =>
  eventChannel(emit => auth.onAuthStateChanged(user => emit(user || {})))

function* watchAuthentication () {
  const channel = yield call(subscribe)
  // Keep on taking events from the eventChannel till infinity
  while (true) {
    const {uid, displayName, photoURL} = yield take(channel)
    if (uid) {
      try {
        yield put(signIn({uid, displayName, photoURL}))
        return
      } catch (error) {
        console.log('auth error:', error)
      }
    }
    yield put(signOut())
  }
}

export function* doCancelAuth () {
  try {
    yield call([auth, auth.signOut])
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

export const initialUserState = {
  loading: false,
  uid: null,
  displayName: null
}

export default (user = initialUserState, action) => {
  switch (action.type) {
    case actions.ATTEMPT_SIGN_IN:
      return assoc('loading', true, user)
    case actions.SIGN_IN:
      return {
        ...user,
        ...action.payload
      }
    case actions.SIGN_OUT:
      return initialUserState
    default:
      return user
  }
}
