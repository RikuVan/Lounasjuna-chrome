import {assocPath} from 'Ramda'

export default (users = {}, action) => {
  switch (action.type) {
    case FETCH_USERS:
      return {
        ...users,
        ...action.payload.users
      }
    case UPDATE_USER_CHOICE:
      return assocPath([payload.user.uid, 'choice'], payload.user.choice, users)
    default:
      return state
  }
}