import {takeLatest} from 'redux-saga'
import {call, put, fork} from 'redux-saga/effects'
import actions from '../../../shared/actions'
import {assoc, dissoc} from 'Ramda'
import {get, sync, CHILD_ADDED, CHILD_REMOVED} from './helpers'

// action creators

export const fetchUsers = () => ({type: actions.FETCH_USERS})
const setUsers = users => ({type: actions.SET_USERS, payload: {users}})
const addUser = user => ({type: actions.ADD_USER, payload: {user}})
const removeUser = ({uid}) => ({type: actions.REMOVE_USER, payload: {uid}})

// sagas

function* syncUsers() {
  yield fork(sync, 'users', {
    [CHILD_ADDED]: addUser,
    [CHILD_REMOVED]: removeUser
 })
}

export function* watchUsers () {
  yield call(takeLatest, actions.FETCH_USERS, get, 'users', {}, setUsers)
}

export const sagas = [watchUsers(), syncUsers()]

// reducer

export default (users = {}, action) => {
  switch (action.type) {
    case actions.SET_USERS:
      return {
        ...users,
        ...action.payload.users
      }
    case actions.ADD_USER:
      return assoc([action.payload.user.uid], action.payload.user, users)
    case actions.REMOVE_USER:
      return dissoc([payload.user.uid], users)
    default:
      return users
  }
}