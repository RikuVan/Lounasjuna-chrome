import config from '../../secrets'
import firebase from 'firebase'

firebase.initializeApp(config.firebase)

export default firebase

export const database = firebase.database()
export const messaging = firebase.messaging()
export const auth = firebase.auth()
export const signInWithCredential = auth.signInWithCredential
export const getGoogleCredential = firebase.auth.GoogleAuthProvider.credential

export const DB = {}
