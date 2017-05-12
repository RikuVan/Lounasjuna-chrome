import config from '../../secrets'
import firebase from 'firebase'

firebase.initializeApp(config.firebase)

export default firebase

export const database = firebase.database()
export const SERVER_TIMESTAMP = firebase.database.ServerValue.TIMESTAMP
export const messaging = firebase.messaging()
export const auth = firebase.auth()
export const getGoogleCredential = firebase.auth.GoogleAuthProvider.credential

export const DB = {
  users: ({userId = ''}) => database.ref(`users${userId ? `/${userId}` : ''}`),
  restaurants: ({restaurantId = ''}) => database.ref(
      `restaurants/${restaurantId ? `${restaurantId}` : ''}`,
    ),
  votes: ({restaurantId, userId}) =>
    database.ref(
      `restaurants/${restaurantId}/currentVotes${userId ? `/${userId}` : ''}`,
    ),
}

