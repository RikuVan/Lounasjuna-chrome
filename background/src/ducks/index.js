import {combineReducers} from 'redux'
import count from './count'
import auth, {initialAuthState} from './auth'

export const initialState = {
  count: 0,
  auth: initialAuthState
}

export default combineReducers({
  count,
  auth
})
