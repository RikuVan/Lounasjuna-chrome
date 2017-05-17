import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import {vote, revokeVotes} from '../../../shared/actions'
import {Button} from '../../../shared/components'
import {getUid} from '../../../shared/selectors'
import {compose, keys, pathOr, propOr, reduce, join, contains} from 'Ramda'
import setClasses from 'classnames'

class Title extends Component {
  state = {showMessage: false}

  handleVote = () =>
    this.props.vote({
      userId: this.props.userId,
      restaurantId: this.props.id,
      name: this.props.name
    })

  handleCancellation = () => this.props.revokeVotes(this.props.userId)

  render () {
    const {
      userId: loggedIn,
      voters,
      path,
      name,
      selectedByCurrentUser
    } = this.props

    return (
      <div className='title-container'>
        <div className={setClasses({'lj-title': loggedIn})}>
          <a href={path}>{name}</a>
        </div>
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

Title.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  vote: PropTypes.func.isRequired,
  revokeVotes: PropTypes.func.isRequired,
  voters: PropTypes.array,
  selectedByCurrentUser: PropTypes.bool.isRequired,
  userId: PropTypes.string.isRequired,
  path: PropTypes.string
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

export default connect(mapStateToProps, {vote, revokeVotes})(Title)
