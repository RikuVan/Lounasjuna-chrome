const firebase = jest.genMockFromModule('firebase')

const defaultResponse = {user: {uid: '1234', displayName: 'Test user'}}

const auth = {
  signInWithPopup: jest.fn(() => Promise.resolve(defaultResponse)),
  googleAuthProvider: {}
}

firebase.auth = auth

export default {
  auth: firebase.auth,
  googleAuthProvider: auth.googleAuthProvider
}
