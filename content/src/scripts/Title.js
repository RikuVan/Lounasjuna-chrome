import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import actions, {vote} from '../../../shared/actions'
import {Button} from '../../../shared/components'
import {getUid} from '../../../shared/selectors'
import {compose, keys, pathOr, propOr, reduce, join} from 'Ramda'

class Title extends Component {
  state = {showMessage: false}

  handleVote = () => this.props.vote({
    userId: this.props.userId,
    restaurantId: this.props.id,
    name: this.props.name}
  )

  suggestLogin = () => this.setState({showMessage: true},
    () => setTimeout(() => this.setState({showMessage: false}), 1000))

  render () {
    const {userId: loggedIn, votes} = this.props
    return (
      <div className='title-container'>
        <div className={loggedIn ? 'lj-title' : ''}>
          <a href={this.props.path}>
            {this.props.name}
          </a>
        </div>
        {loggedIn && <Button
          type='voting'
          onClick={loggedIn ? this.handleVote : this.suggestLogin}
        >
          <span className="button-voting--text">{votes.length}</span>
        </Button>}
        <div className="lj-votes">
          {!loggedIn && this.state.showMessage && <div>Sign in to vote</div>}
          {loggedIn && votes.length > 0 &&
            <small className="voter">
              <span className="logo-train">🚂</span>
              {' '}{join(', ', votes)}
            </small>
          }
        </div>
      </div>
    )
  }
}

Title.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
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
