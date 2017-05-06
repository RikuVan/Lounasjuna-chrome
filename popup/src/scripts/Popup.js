import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {Button} from './components'
import {
  getIsSignedIn,
  isAuthorizingUser
} from '../../../shared/selectors'
import actions from '../../../shared/actions'

class Popup extends Component {

  handleClick = () => this.props.signedIn
    ? this.props.dispatch({type: actions.CANCEL_AUTH})
    : this.props.dispatch({type: actions.ATTEMPT_SIGN_IN})

  render () {
    console.log(this.props)
    return (
      <div className='popup-container'>
        <header>Lounasjuna</header>
        <main className='main'>
          <Button
            type='signin'
            onClick={this.handleClick}
          >
            {this.props.signedIn ? 'Sign Out' : 'Sign In'}
          </Button>
        </main>
      </div>
    )
  }
}

Popup.propTypes = {
  signedIn: PropTypes.bool,
  dispatch: PropTypes.func.isRequired
}
//Todo use loading to show spinner when logging in
const mapStateToProps = state => ({
  signedIn: getIsSignedIn(state),
  loading: isAuthorizingUser(state)
})

export default connect(mapStateToProps)(Popup)
