import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'
import actions from '../../../shared/actions'
import {getUid} from '../../../shared/selectors'

class Title extends Component {
  componentDidMount () {
    document.getElementById(this.props.id).addEventListener('click', () => {
      this.props.dispatch({
        type: 'ADD_COUNT'
      })
    })
  }


  render () {
    return (
      <div className='background'>
        <a href={this.props.path}>
          {this.props.name}
        </a>
        <div>{this.props.count}</div>
      </div>
    )
  }
}

Title.propTypes = {
  count: PropTypes.number,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  users: state.users,
  userId: getUid(state),
  count: state.count
})

export default connect(mapStateToProps)(Title)
