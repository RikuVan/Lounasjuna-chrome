import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {Button} from '../../../shared/components'
import {getIsSignedIn, isAuthorizingUser} from '../../../shared/selectors'
import {attemptSignIn, cancelGoogleAuth} from '../../../shared/actions'

class Popup extends Component {
  handleClick = () =>
    (this.props.signedIn
      ? this.props.cancelGoogleAuth()
      : this.props.attemptSignIn())

  render () {
    const {signedIn, loading} = this.props
    return (
      <div className='popup-container'>
        <header>
          <h2>
            Lounasjuna
          </h2>
        </header>
        <main className='main'>
          <Button
            tabIndex='-1'
            type='signin'
            onClick={this.handleClick}
            loading={loading}
          >
            {signedIn ? 'Sign out' : 'Sign in with Google'}
          </Button>
          <Button
            tabIndex='-1'
            type='stats'
            onClick={this.handleClick}
            disabled={signedIn}
          >
            Check the stats
          </Button>
        </main>
      </div>
    )
  }
}

Popup.propTypes = {
  signedIn: PropTypes.bool.isRequired,
  attemptSignIn: PropTypes.func.isRequired,
  cancelGoogleAuth: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired
}

const mapStateToProps = state => ({
  signedIn: getIsSignedIn(state),
  loading: isAuthorizingUser(state)
})

export default connect(mapStateToProps, {attemptSignIn, cancelGoogleAuth})(
  Popup
)
