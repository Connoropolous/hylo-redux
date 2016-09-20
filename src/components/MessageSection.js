import React from 'react'
import { isEmpty, sortBy, values } from 'lodash'
const { array, bool, func, object } = React.PropTypes
import cx from 'classnames'
import MessageForm from './MessageForm'
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

  componentDidMount () {
    const { post: { id }} = this.props
    const { dispatch } = this.context
    this.socket = getSocket()
    this.socket.post(socketUrl(`/noo/post/${id}/subscribe`))
    this.socket.on('commentAdded', c => dispatch(appendComment(id, c)))
  }

  componentWillUnmount () {
    const { post: { id }} = this.props
    if (this.socket) {
      this.socket.post(socketUrl(`/noo/post/${id}/unsubscribe`))
      this.socket.off('commentAdded')
    }
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
      <MessageForm postId={post.id} />
    </div>
  }
}

