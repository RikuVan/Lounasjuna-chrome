import {pathOr, isNil, compose, complement} from 'Ramda'

// auth
export const getIsSignedIn = compose(complement(isNil), pathOr(null, ['auth', 'uid']))
export const isAuthorizingUser = pathOr(false, ['auth', 'loading'])