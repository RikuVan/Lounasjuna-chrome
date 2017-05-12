import React, {PropTypes} from 'react'

const Loading = ({small}) => {
  return (
    <i className={`fa fa-spinner fa-pulse ${!small ? 'fa-3x' : ''} fa-fw`} />
  )
}

Loading.propTypes = {
  small: PropTypes.bool,
}

export default Loading