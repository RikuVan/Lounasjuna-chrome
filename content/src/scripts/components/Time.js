import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'

const formatTime = timestamp => moment(timestamp * 1000).format('H:mm')

const Time = ({timestamp}) => (
  <span className="lj-time">
    {timestamp === '?' ? timestamp : formatTime(timestamp)}
  </span>
)

Time.propTypes = {
  timestamp: PropTypes.string.isRequired
}

export default Time