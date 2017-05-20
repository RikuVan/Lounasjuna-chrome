import React, {Component} from 'react'
import Select from 'react-select'
import 'react-select/dist/react-select.css'
import moment from 'moment'
import {compose, split, prop, head, tail, isNil} from 'Ramda'
import propTypes from 'prop-types'

const splitAtColonFor = key => compose(split(':'), prop(key))
const getHour = key => compose(head, splitAtColonFor(key))
const getMinutes = key => compose(tail, splitAtColonFor(key))

const generateOptions = data => {
  const startHour = getHour('start')(data)
  const startMinutes = getMinutes('start')(data)
  const endHour = getHour('end')(data)
  const endMinutes = getMinutes('end')(data)
  const start = moment().hours(startHour).minutes(startMinutes)
  const end = moment().hours(endHour).minutes(endMinutes)
  let options = [
    {value: moment().hours(0).minutes(0), label: 'Any time'},
    {value: start.unix(), label: start.format('h:mm')}
  ]
  let nextTime = start
  do {
    nextTime.add(15, 'm')
    options.push({value: nextTime.unix(), label: nextTime.format('h:mm')})
  } while (nextTime.unix() < end.unix())
  return options
}

const getInitialState = () => ({value: null, label: 'Valitse aika...'})

class TimePicker extends Component {
  state = getInitialState()

  onChange = option => {
    this.setState(() => (isNil(option) ? getInitialState() : option))
  }

  render () {
    const {hours, disabled} = this.props
    const options = generateOptions(hours)
    return (
      <Select
        value={this.state}
        onChange={this.onChange}
        options={options}
        disabled={disabled}
      />
    )
  }
}

TimePicker.propTypes = {
  hours: PropTypes.object.isRequired,
  disabled: PropTypes.bool.isRequired
}

export default TimePicker
