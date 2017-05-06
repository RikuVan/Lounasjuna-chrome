import {sagas as auth} from './ducks/auth'
import {sagas as count} from './ducks/count'
import {sagas as users} from './ducks/users'

export default function* rootSaga () {
  yield [auth, count, users]
}
