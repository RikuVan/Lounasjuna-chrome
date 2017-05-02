import {sagas as auth} from './ducks/auth'
import {sagas as count} from './ducks/count'

export default function* rootSaga () {
  yield [auth, count]
}
