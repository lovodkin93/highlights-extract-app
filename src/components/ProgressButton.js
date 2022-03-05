import PropTypes from 'prop-types'

const ProgressButton = ({ color, text, onClick }) => {
  return (
    <button
      onClick={onClick} /* an event */
      style={{ backgroundColor: color }}
      className='btn'
    >
      {text}
    </button>
  )
}

ProgressButton.defaultProps = {
  color: 'steelblue',
}

ProgressButton.propTypes = {
  text: PropTypes.string,
  color: PropTypes.string,
  onClick: PropTypes.func,
}

export default ProgressButton
