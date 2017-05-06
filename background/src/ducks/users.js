import {takeLatest} from 'redux-saga'
import {call, put} from 'redux-saga/effects'
import actions from '../../../shared/actions'
import {assoc, dissoc} from 'Ramda'
import {get} from './requests'

const setUsers = users => ({type: actions.SET_USERS, payload: {users}})
const addUser = user => ({type: actions.ADD_USER, payload: {user}})
const fetchUsers = () => ({type: actions.FETCH_USERS})

export function* watchUser () {
  yield call(takeLatest, actions.ADD_USER, set, 'users', {userId}, payload, fetchUsers)
}
export function* watchUsers () {
  yield call(takeLatest, actions.FETCH_USERS, get, 'users', {}, setUsers)
}

export const sagas = [watchUsers()]

export default (users = {}, action) => {
  switch (action.type) {
    case actions.SET_USERS:
      return {
        ...users,
        ...action.payload.users
      }
    case actions.ADD_USER:
      return assoc([payload.user.uid], payload.user, users)
    case actions.REMOVE_USER:
      return dissoc([payload.user.uid], users)
    default:
      return users
  }
}