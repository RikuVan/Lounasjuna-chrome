const actions = {
  /**
   * AUTH ACTIONS
   */
  ATTEMPT_SIGN_IN: 'ATTEMPT_SIGN_IN',
  SIGN_IN: 'SIGN_IN',
  SIGN_OUT: 'SIGN_OUT',
  CANCEL_AUTH: 'CANCEL_AUTH',
  /**
   * USER ACTIONS
   */
  FETCH_USERS: 'FETCH_USERS',
  SET_USERS: 'SET_USERS',
  SAVE_USER: 'SAVE_USER',
  ADD_USER: 'ADD_USER',
  REMOVE_USER: 'REMOVE_USER',
  /**
   * RESTAURANT ACTIONS
   */
  FETCH_RESTAURANTS: 'FETCH_RESTAURANTS',
  SET_RESTAURANTS: 'SET_RESTAURANTS',
  VOTE: 'VOTE',
  REVOKE_VOTES: 'REVOKE_VOTES',
  UPDATE_RESTAURANT: 'UPDATE_RESTAURANT',
  REMOVE_RESTAURANT: 'REMOVE_RESTAURANT',
  SET_LUNCH_TIME: 'SET_LUNCH_TIME'
}

export default actions

/**
 * ACTION CREATORS
 */

// restaurants
export const vote = payload => ({type: actions.VOTE, payload})
export const revokeVotes = userId => ({
  type: actions.REVOKE_VOTES,
  payload: {userId}
})
export const setLunchTime = (id, time) => ({
  type: actions.SET_LUNCH_TIME,
  payload: {id, time}
})

// auth
export const attemptSignIn = () => ({type: actions.ATTEMPT_SIGN_IN})
export const cancelGoogleAuth = () => ({type: actions.CANCEL_AUTH})
