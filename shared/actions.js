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
  REVOKE_VOTE: 'REVOKE_VOTE',
  ADD_VOTE: 'ADD_VOTE',
  REMOVE_VOTE: 'REMOVE_VOTE'
}

export default actions

/**
 * ACTION CREATORS
 */

export const vote = payload =>
  ({type: actions.VOTE, payload: {...payload}})