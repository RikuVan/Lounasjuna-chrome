import React from 'react'
import PropTypes from 'prop-types'
import Time from './Time'
import {join} from 'Ramda'

const LunchTrain = ({date, voters}) => (
  <div>
    <Time timestamp={date} />
    <small className='voter'>
      <span className='logo-train'>🚂</span>
      {' '}{join(', ', voters)}
    </small>
  </div>
)

LunchTrain.propTypes = {
  date: PropTypes.string.isRequired,
  voters: PropTypes.array.isRequired
}

export default LunchTrain
