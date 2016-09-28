import React from 'react'
import { isEmpty, sortBy, values } from 'lodash'
const { array, bool, func, object } = React.PropTypes
import cx from 'classnames'
import PeopleTyping from './PeopleTyping'
import Message from './Message'
import { appendComment } from '../actions/comments'
import { getSocket, socketUrl } from '../client/websockets'

export default class MessageSection extends React.Component {
  static propTypes = {
    messages: array,
    post: object,
  }

  static contextTypes = {
    community: object,
    currentUser: object,
    dispatch: func
  }

  render () {
    let { post, messages } = this.props
    const { currentUser, community } = this.context

    if (!messages) messages = []
    messages = sortBy(messages, m => m.created_at)

    return <div className={cx('messages-section post-section', {empty: isEmpty(messages)})}>
      {messages.map(m => <Message message={{...m, post_id: post.id}}
        community={community}
        key={m.id}/>)}
      <PeopleTyping showNames={true}/>
    </div>
  }
}

