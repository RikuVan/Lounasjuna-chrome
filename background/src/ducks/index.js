import {combineReducers} from 'redux'
import count from './count'
import auth from './auth'

export default combineReducers({
  count,
  auth
})
