import {combineReducers} from 'redux'
import count from './count'
import auth, {initialAuthState} from './auth'
import users from './users'

export const initialState = {
  count: 0,
  auth: initialAuthState,
  users: {}
}

export default combineReducers({
  count,
  auth,
  users
})
