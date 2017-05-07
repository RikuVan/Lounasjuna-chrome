import {sagas as auth} from './ducks/auth'
import {sagas as users} from './ducks/users'
import {sagas as restaurants} from './ducks/restaurants'

export default function* rootSaga () {
  yield [
    auth,
    users,
    restaurants
  ]
}
