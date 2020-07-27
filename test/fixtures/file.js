import React from 'react'
import PropTypes from 'prop-types'
import warning from 'warning'

import contextTypes from './utils/contextType'
import mergeWithEvents from './utils/chainEvents'
import Trigger from './MessageTrigger'

//
import('./foo')

async function hey() {
  await true
}

class Button extends React.Component {
  static propTypes = {
    type: PropTypes.oneOf(['button', 'submit']),
    group: PropTypes.string,
    formKey: PropTypes.string,
    component: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    events: PropTypes.arrayOf(PropTypes.string),
    onClick: PropTypes.func,
  }

  static contextTypes = contextTypes

  static defaultProps = {
    type: 'button',
    component: 'button',
    events: ['onClick'],
  }

  handleSubmit = (...args) => {
    let { formKey, onClick } = this.props
    let context = this.context.reactFormalContext

    if (onClick) onClick(...args)
    if (context) context.submitForm(formKey || '@@parent')
  }

  render() {
    let { type, group, events, component: Component, ...props } = this.props

    warning(
      !group || type.toLowerCase() !== 'submit',
      'You have specified a `group` prop with type="submit" on this Form.Button component. ' +
        'submit type buttons will automatically trigger a form wide validation. ' +
        'to trigger validation for just the group: `' +
        group +
        '` use type="button" instead.',
    )

    delete props.formKey

    if (type.toLowerCase() === 'submit')
      return (
        <Component {...props} onClick={this.handleSubmit}>
          {this.props.children}
        </Component>
      )

    return (
      <Trigger group={group || '@all'} events={events}>
        {({ messages: _, ...triggerProps }) => (
          <Component
            {...mergeWithEvents(events, [props, triggerProps])}
            type={type}
          >
            {this.props.children}
          </Component>
        )}
      </Trigger>
    )
  }
}

export default Button
