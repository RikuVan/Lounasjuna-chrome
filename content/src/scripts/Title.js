import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import actions, {vote} from '../../../shared/actions'
import {getUid} from '../../../shared/selectors'
import {compose, keys, pathOr, propOr, reduce, join} from 'Ramda'

class Title extends Component {
  handleVote = () => this.props.vote({
    userId: this.props.userId,
    restaurantId: this.props.id,
    name: this.props.name}
  )

  render () {
    return (
      <div className='background'>
        <a href={this.props.path}>
          {this.props.name}
        </a>
        <div onClick={this.handleVote}>Vote</div>
        {this.props.votes.length > 0 &&
          <small>{join(', ', this.props.votes)}</small>
        }
      </div>
    )
  }
}

Title.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  vote: PropTypes.func.isRequired
}

const getVotes = (state, ownProps) => {
  const currentVoteIds = compose(
    keys,
    pathOr({}, ['restaurants', ownProps.id, 'currentVotes'])
  )(state)
  const users = propOr({}, 'users', state)
  return reduce((votes, id) => {
    const vote = pathOr(null, [id, 'displayName'], users)
    return votes.concat(vote ? vote : [])
  }, [], currentVoteIds)
}

const mapStateToProps = (state, ownProps) => ({
  userId: getUid(state),
  votes: getVotes(state, ownProps)
})

export default connect(mapStateToProps, {vote})(Title)
