import {
  watchLogin,
  watchCancel,
  login,
  doCancelAuth,
  attemptSignIn,
  signIn,
  signOut,
  initialUserState,
  ATTEMPT_SIGN_IN,
  SIGN_IN,
  SIGN_OUT,
  CANCEL_AUTH
} from './auth'
import {call} from 'redux-saga/effects'
import {takeEvery} from 'redux-saga'
import authReducer from './auth'
import {merge} from 'ramda'
// import { expectSaga } from 'redux-saga-test-plan';

jest.mock('../firebase')

// Sagas

test('watchAuth should trigger login on ATTEMPT_SIGN_IN', () => {
  const iterator = watchLogin()
  const expectedYield = call(takeEvery, ATTEMPT_SIGN_IN, login)
  const actualYield = iterator.next().value
  expect(actualYield).toMatchObject(expectedYield)
})

test('cancelAuth should trigger on doCancelAuth on CANCEL_AUTH', () => {
  const iterator = watchCancel()
  const expectedYield = call(takeEvery, CANCEL_AUTH, doCancelAuth)
  const actualYield = iterator.next().value
  expect(actualYield).toMatchObject(expectedYield)
})

// Reducer

test('Should return initialUserState on ATTEMPT_SIGN_IN', () => {
  const authAction = attemptSignIn()
  const newState = authReducer(initialUserState, authAction)
  expect(newState).toEqual(merge(initialUserState, {loading: true}))
})

test('Should have user and not be loading on SIGN_IN', () => {
  const userData = {uid: '1234', displayName: 'Pekka'}
  const authAction = signIn(userData)
  const newState = authReducer(initialUserState, authAction)
  expect(newState).toEqual(merge(initialUserState, userData))
})

test('Should return initialUserState on SIGN_OUT', () => {
  const authAction = signOut()
  const newState = authReducer(initialUserState, authAction)
  expect(newState).toEqual(initialUserState)
})
