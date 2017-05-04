import {eventChannel, takeEvery, channel} from 'redux-saga'
import {call, put, take} from 'redux-saga/effects'
import {auth, getGoogleCredential, signInWithCredential} from '../firebase'
import {pick, isEmpty, pathOr, has, assoc} from 'Ramda'

//chrome

const getToken = chrome.identity.getAuthToken

// Helpers

const getUserData = pick(['displayName', 'uid'])

// Actions

export const ATTEMPT_SIGN_IN = 'ATTEMPT_SIGN_IN'
export const SIGN_IN = 'SIGN_IN'
export const SIGN_OUT = 'SIGN_OUT'
export const CANCEL_AUTH = 'CANCEL'

export const signIn = user => ({type: SIGN_IN, payload: user})
export const signOut = () => ({type: SIGN_OUT})
export const attemptSignIn = () => ({type: ATTEMPT_SIGN_IN})
export const cancelGoogleAuth = () => ({type: CANCEL_AUTH})

// Selectors

export const isAuthorizingUser = pathOr(false, ['auth', 'loading'])
export const isLoggedIn = has('uid')

// Sagas

const loginChannelWrapper = channel => token => {
  if(token) {
    console.log("token", token)
  } else {
    console.log("nothing")
  }
}

const maybeToken = interactive => {
  return new Promise(resolve => {
    return getToken({interactive}, resolve)
  })
}

const removeToken = token => {
  return new Promise(resolve => {
    return chrome.identity.removeCachedAuthToken({token}, resolve)
  })
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
      const {uid, displayName, photoURL, ...rest} = yield call([auth, signInWithCredential], credential)
      // TODO: if the user has never signed in before we need to add them to
      // to list of users in the DB here by checking state for the user
      // and dispatching an action
      //const user = response.user
      if (uid) {
        yield put(signIn({uid, displayName, photoURL}))
      } else {
        console.error('The OAuth Token was null')
      }
    }
  } catch (error) {
    console.log('login error:', error)
  }
}

export function* watchLogin () {
  // takeEvery/takeLatest is an alternative to the "while (true)" pattern
  yield takeEvery(ATTEMPT_SIGN_IN, login, true)
}

const subscribe = () =>
  eventChannel(emit => auth.onAuthStateChanged(user => emit(user || {})))

function* watchAuthentication () {
  //const channel = yield call(subscribe)
  // Keep on taking events from the eventChannel till infinity
  /*while (true) {
    const user = yield take(channel)
    if (user && !isEmpty(user)) {
      try {
        yield put(signIn(user))
        return user
      } catch (error) {
        console.log('auth error:', error)
      }
    }
    yield put(signOut())
  }*/
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
  // takeEvery/takeLatest is an alternative to the "while (true)" pattern
  yield call(takeEvery, CANCEL_AUTH, doCancelAuth)
}

// Instead of manually calling notify after each SIGN_IN let's just trigger it automatically.
// With redux-thunk you'd use a custom middleware to dispatch an action following a certain action.
// function* doShowNotification() {
//  yield put(notify('LOGGED_IN'))
// }

// function* showLoginNotification() {
//  yield takeEvery(SIGN_IN, doShowNotification)
// }

export const sagas = [watchLogin(), watchAuthentication(), watchCancel()]

// Reducer

export const initialUserState = {
  loading: false,
  uid: null,
  displayName: null
}

export default (user = initialUserState, action) => {
  switch (action.type) {
    case ATTEMPT_SIGN_IN:
      return assoc('loading', true, user)
    case SIGN_IN:
      return {
        ...user,
        ...action.payload
      }
    case SIGN_OUT:
      return initialUserState
    default:
      return user
  }
}
