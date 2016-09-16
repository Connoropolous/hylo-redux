import React from 'react'
import values from 'lodash'
const { array, bool, func, object, string } = React.PropTypes

export default class PeopleTyping extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      peopleTyping: {}
    }
  }

  static propTypes = {
    names: array,
    showNames: bool
  }

  static contextTypes = {
    socket: object
  }

  componentDidMount () {
    this.context.socket.on('userTyping', this.userTyping.bind(this))
  }

  componentWillUnmount () {
    this.context.socket.off('userTyping')
  }

  userTyping (data) {
    let newState = this.state
    if (data.isTyping) {
      newState.peopleTyping[data.userId] = data.userName
    } else {
      delete newState.peopleTyping[data.userId]
    }
    this.setState(newState)
  }

  render () {
    const { showNames } = this.props
    const names = values(this.state.peopleTyping)
    return names.length ? <div className='typing'>
      {!showNames && names.length == 1 && <div>someone is typing</div>}
      {showNames && names.length == 1 && <div>{names[0]} is typing</div>}
      {names.length > 1 && <div>multiple people are typing</div>}
    </div> : null
  }

}
