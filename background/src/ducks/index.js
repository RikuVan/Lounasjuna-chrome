import {combineReducers} from 'redux'
import auth, {initialAuthState} from './auth'
import users from './users'
import restaurants from './restaurants'

export const initialState = {
  auth: initialAuthState,
  users: {},
  restaurants: {}
}

export default combineReducers({
  auth,
  users,
  restaurants
})
