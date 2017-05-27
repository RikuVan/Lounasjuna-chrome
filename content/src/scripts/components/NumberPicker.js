import React from 'react'
import PropTypes from 'prop-types'
import NumberInput from 'rc-input-number'
import 'rc-input-number/assets/index.less'

const NumberPicker = ({
  onChange,
  value,
  type,
  ...rest
}) => (
  <NumberInput
    onChange={onChange(type)}
    value={value}
    {...rest}
  />
)

NumberPicker.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired
}

export default NumberPicker