import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import {vote, revokeVotes, setLunchTime} from '../../../shared/actions'
import {Button} from '../../../shared/components'
import {getUid} from '../../../shared/selectors'
import {
  compose,
  keys,
  pathOr,
  groupBy,
  values,
  propOr,
  reduce,
  contains,
  converge,
  prop,
  map,
  toPairs,
  mapObjIndexed,
  head,
  split,
  assoc
} from 'Ramda'
import TimePicker from './components/TimePicker'
import LunchTrain from './components/LunchTrain'
import moment from 'moment'

const getUnixTime = ([hour, minutes]) => {
  if (hour === '?') return hour
  return moment().hours(hour).minutes(minutes).seconds(0).unix()
}

const getCurrentTime = (props, state) =>
  pathOr(null, [props.id, 'time'], prop('restaurants', state))

const getNextTimeFromNow = hours => {
  const startingTime = moment(hours.start, 'HH:mm')
  const now = moment()
  if (startingTime.isAfter(now)) {
    return hours
  }
  return assoc('start', now.format('HH:mm'), hours)
}

class Restaurant extends Component {
  state = {open: true}

  componentDidMount () {
    const closingTime = moment(this.props.hours.end, 'HH:mm')
    const now = moment()
    this.setState({open: now.isBefore(closingTime)})
  }

  handleVote = async () => {
    await this.props.vote({
      userId: this.props.userId,
      restaurantId: this.props.id,
      name: this.props.name,
      timestamp: compose(getUnixTime, split(':'))(this.props.time || '?')
    })
    // repaint in order to re-establish padding between
    // the cards in the jQuery isotope layout
    setTimeout(() => window.dispatchEvent(new Event('resize')), 100)
  }

  handleCancellation = () => this.props.revokeVotes(this.props.userId)

  render () {
    const {userId: loggedIn, voters, hours, selectedByCurrentUser} = this.props
    const dates = keys(voters)
    if (!loggedIn) {
      return (
        <div>
          <span className='logo-train'>🚂</span>
          {' '}Lounasjuna: uloskirjoitettu
        </div>
      )
    }
    return (
      <div className='lj-container'>
        {dates.length > 0 &&
          <div className='lj-votes'>
            {dates.map((date, i) => (
              <LunchTrain key={i} date={date} voters={voters[date]} />
            ))}
          </div>}
        <div className='date-picker-and-button'>
          <TimePicker
            id={this.props.id}
            time={this.props.time}
            hours={getNextTimeFromNow(hours)}
            disabled={selectedByCurrentUser || !this.state.open}
            onChange={this.props.setLunchTime}
            selected={selectedByCurrentUser}
          />
          <Button
            type='voting'
            active={selectedByCurrentUser}
            onClick={
              selectedByCurrentUser ? this.handleCancellation : this.handleVote
            }
          >
            <span className='button-voting--text'>
              {selectedByCurrentUser
                ? 'Poista'
                : this.state.open ? 'Valitse' : 'Suljettu'}
            </span>
          </Button>
        </div>
      </div>
    )
  }
}

Restaurant.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  vote: PropTypes.func.isRequired,
  revokeVotes: PropTypes.func.isRequired,
  voters: PropTypes.object,
  selectedByCurrentUser: PropTypes.bool.isRequired,
  userId: PropTypes.string,
  hours: PropTypes.object.isRequired,
  time: PropTypes.string,
  setLunchTime: PropTypes.func.isRequired
}

const getCurrentVotes = id => pathOr({}, ['restaurants', id, 'currentVotes'])
const getCurrentVotesIds = id => compose(keys, getCurrentVotes(id))

const getIsSelectedByCurrentUser = ownProps =>
  converge(contains, [getUid, getCurrentVotesIds(prop('id', ownProps))])
const groupVoters = groupBy(values)

const mapGroupedVoters = users => voters =>
  reduce(
    (votes, voter) => {
      const id = compose(head, keys)(voter)
      const vote = pathOr(null, [id, 'displayName'], users)
      return votes.concat(vote || [])
    },
    [],
    voters
  )

const getVoters = (state, ownProps) => {
  const users = propOr({}, 'users', state)

  return compose(
    mapObjIndexed(mapGroupedVoters(users)),
    groupVoters,
    map(([key, value]) => ({[key]: value})),
    toPairs,
    getCurrentVotes(ownProps.id)
  )(state)
}

const mapStateToProps = (state, ownProps) => ({
  userId: getUid(state),
  voters: getVoters(state, ownProps),
  selectedByCurrentUser: getIsSelectedByCurrentUser(ownProps)(state),
  time: getCurrentTime(ownProps, state)
})

export default connect(mapStateToProps, {vote, revokeVotes, setLunchTime})(
  Restaurant
)
