import React from 'react'
import Avatar from './Avatar'
import A from './A'
import { some } from 'lodash'
import { get } from 'lodash/fp'
import { humanDate, prependInP, present, textLength } from '../util/text'
import { sanitize } from 'hylo-utils/text'
import { commentUrl } from '../routes'
import truncateHtml from 'trunc-html'
var { func, object, bool } = React.PropTypes

const spacer = <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>

class Message extends React.Component {
  static propTypes = {
    community: object,
    message: object.isRequired,
  }

  static contextTypes = {
    dispatch: func.isRequired,
    currentUser: object
  }

  render () {
    const { message, community } = this.props
    const { dispatch, currentUser } = this.context

    const person = message.user
    let text = present(sanitize(message.text), {slug: get('slug', community)})

    return <div className='message' data-message-id={message.id}>
      <a name={`message-${message.id}`}></a>
      <Avatar person={person}/>
      <div className='content'>
        <p>
          <A to={`/u/${person.id}`}><strong className='name'>{sanitize(person.name)}</strong></A>
          <A className='date' to={commentUrl(message)}>{humanDate(message.created_at)}</A>
        </p>
        <p className='text' dangerouslySetInnerHTML={{__html: text}}/>
      </div>
    </div>
  }
}

export default Message

