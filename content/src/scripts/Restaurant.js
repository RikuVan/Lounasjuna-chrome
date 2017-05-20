import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import {vote, revokeVotes} from '../../../shared/actions'
import {Button} from '../../../shared/components'
import {getUid} from '../../../shared/selectors'
import {compose, keys, pathOr, propOr, reduce, join, contains} from 'Ramda'
import DatePicker from './components/TimePicker'

class Restaurant extends Component {
  handleVote = async () => {
    await this.props.vote({
      userId: this.props.userId,
      restaurantId: this.props.id,
      name: this.props.name
    })
    // we need to repaint in order to restablish padding between
    // the cards in the jQuery isotope layout
    setTimeout(() => window.dispatchEvent(new Event('resize')), 100)
  }

  handleCancellation = () => this.props.revokeVotes(this.props.userId)

  render () {
    const {
      userId: loggedIn,
      voters,
      name,
      hours,
      selectedByCurrentUser
    } = this.props

    return (
      <div className='lj-container'>
        {loggedIn &&
          <Button
            type='voting'
            active={selectedByCurrentUser}
            onClick={
              selectedByCurrentUser ? this.handleCancellation : this.handleVote
            }
          >
            <span className='button-voting--text'>
              {voters.length > 0 ? voters.length : '+'}
            </span>
          </Button>}
        <DatePicker
          hours={this.props.hours}
          userId={this.props.userId}
          disabled={selectedByCurrentUser}
        />
        <div className='lj-votes'>
          {loggedIn &&
            voters.length > 0 &&
            <small className='voter'>
              <span className='logo-train'>🚂</span>
              {' '}{join(', ', voters)}
            </small>}
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
  voters: PropTypes.array,
  selectedByCurrentUser: PropTypes.bool.isRequired,
  userId: PropTypes.string,
  hours: PropTypes.object.isRequired
}

const getCurrentVoteIds = id =>
  compose(keys, pathOr({}, ['restaurants', id, 'currentVotes']))

const getIsSelectedByCurrentUser = (state, ownProps) => {
  const currentVoteIds = getCurrentVoteIds(ownProps.id)(state)
  return contains(getUid(state), currentVoteIds)
}

const getVoters = (state, ownProps) => {
  const currentVoteIds = getCurrentVoteIds(ownProps.id)(state)
  const users = propOr({}, 'users', state)
  return reduce(
    (votes, id) => {
      const vote = pathOr(null, [id, 'displayName'], users)
      return votes.concat(vote || [])
    },
    [],
    currentVoteIds
  )
}

const mapStateToProps = (state, ownProps) => ({
  userId: getUid(state),
  voters: getVoters(state, ownProps),
  selectedByCurrentUser: getIsSelectedByCurrentUser(state, ownProps)
})

export default connect(mapStateToProps, {vote, revokeVotes})(Restaurant)
