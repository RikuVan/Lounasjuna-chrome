import React, {Component} from 'react'
import {connect} from 'react-redux'

class App extends Component {
  componentDidMount () {
    document.addEventListener('click', () => {
      console.log("clicked")
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

const mapStateToProps = (state) => ({count: state.count})

export default connect(mapStateToProps)(App)
