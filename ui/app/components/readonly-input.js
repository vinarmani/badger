const Component = require('react').Component
const h = require('react-hyperscript')
const inherits = require('util').inherits

module.exports = ReadOnlyInput

inherits(ReadOnlyInput, Component)
function ReadOnlyInput () {
  Component.call(this)
}

ReadOnlyInput.prototype.componentDidUpdate = function () {
  //this.props.onChange(this.props.value)
}

ReadOnlyInput.prototype.handleChange - function (e) {
  this.props.onChange(e.target.value);
}

ReadOnlyInput.prototype.render = function () {
  const {
    wrapperClass = '',
    inputClass = '',
    value,
    textarea,
    onClick,
  } = this.props

  const inputType = textarea ? 'textarea' : 'input'

  return h('div', { className: wrapperClass }, [
    h(inputType, {
      className: inputClass,
      value,
      readOnly: false,
      onFocus: event => event.target.select(),
      onChange: this.handleChange,
      onClick,
    }),
  ])
}
