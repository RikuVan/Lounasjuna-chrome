import React from 'react'
import PropTypes from 'prop-types'
import Loading from './Loading'

const Button = (
  {
    children,
    className,
    htmlType,
    onClick,
    type,
    loading,
    icon,
    disabled,
    ...rest
  },
) => (
  <button
    className={
      `lj-button ${type ? 'button-' + type : ''} ${disabled ? 'disabled' : ''}`
    }
    onClick={!disabled && onClick}
    type={htmlType}
    {...rest}
  >
    {icon && <i className={`button-icon fa fa-${icon}`}/>}
    {loading ? <Loading small={true} /> : children}
  </button>
)

Button.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  htmlType: PropTypes.string,
  type: PropTypes.string,
  onClick: PropTypes.func
}

export default Button
