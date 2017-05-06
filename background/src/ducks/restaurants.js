import actions from '../../../shared/actions'

export default (restaurants = {}, action) => {
  switch (action.type) {
    case actions.FETCH_RESTAURANTS:
      return {
        ...users,
        ...action.payload.users
      }
    default:
      return state
  }
}