import {pathOr, isNil, compose, complement} from 'Ramda'

// auth
export const getUid = pathOr(null, ['auth', 'uid'])
export const getIsSignedIn = compose(complement(isNil), getUid)
export const isAuthorizingUser = pathOr(false, ['auth', 'loading'])
