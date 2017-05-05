import React, {Component} from 'react'
import {connect} from 'react-redux'
import PropTypes from 'prop-types'

class Chooser extends Component {
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
          {this.props.name}{': '}{this.props.count}
        </a>
      </div>
    )
  }
}

Chooser.propTypes = {
  count: PropTypes.number,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired
}

const mapStateToProps = state => ({count: state.count})

export default connect(mapStateToProps)(Chooser)
