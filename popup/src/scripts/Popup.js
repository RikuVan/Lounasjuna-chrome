import React, {Component} from 'react'
import {connect} from 'react-redux'

class Popover extends Component {
  componentWillReceiveProps (nextProps) {
    console.log('receiving props:', nextProps)
  }

  handleClick = () => this.props.dispatch({type: 'ATTEMPT_SIGN_IN'})

  render () {
    console.log(this.props)
    return (
      <div className='popup-container'>
        <header>Lounasjuna</header>
        <main className='main'>
          <button
            className='button button--signin'
            onClick={this.handleClick}
          >
            Sign In
          </button>
          <pre>{JSON.stringify(this.props, null, 2)}</pre>
        </main>
      </div>
    )
  }
}

const mapStateToProps = state => ({...state})

export default connect(mapStateToProps)(Popover)
