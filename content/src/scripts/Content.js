import React, {Component} from 'react'
import {connect} from 'react-redux'

class Content extends Component {
  componentDidMount () {
    document.addEventListener('click', () => {
      this.props.dispatch({
        type: 'ADD_COUNT'
      })
    })
  }

  render () {
    return (
      <div>
        Count: {this.props.count}
      </div>
    )
  }
}

const mapStateToProps = state => ({count: state.count})

export default connect(mapStateToProps)(Content)
