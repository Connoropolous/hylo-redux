import React from 'react'
import { get, debounce, throttle } from 'lodash'
import { connect } from 'react-redux'
import { CREATE_COMMENT } from '../actions'
import { createComment, updateCommentEditor } from '../actions/comments'
import { ADDED_COMMENT, trackEvent } from '../util/analytics'
import { textLength } from '../util/text'
import { onCmdOrCtrlEnter } from '../util/textInput'
import cx from 'classnames'
import { getSocket, socketUrl } from '../client/websockets'
var { array, bool, func, object, string } = React.PropTypes

// The interval between repeated typing notifications to the web socket. We send
// repeated notifications to make sure that a user gets notified even if they
// load a comment thread after someone else has already started typing.
const STARTED_TYPING_INTERVAL = 5000

// The time to wait for inactivity before announcing that typing has stopped.
const STOPPED_TYPING_WAIT_TIME = 8000

@connect((state, { postId }) => {
  return ({
    currentUser: get(state, 'people.current'),
    editingTagDescriptions: state.editingTagDescriptions,
    text: state.commentEdits.new[postId]
  })
})
export default class MessageForm extends React.Component {
  static propTypes = {
    currentUser: object,
    dispatch: func,
    postId: string,
    placeholder: string,
    text: string
  }

  static contextTypes = {
    isMobile: bool,
  }

  submit = event => {
    const { dispatch, postId } = this.props
    if (event) event.preventDefault()
    const text = this.refs.editor.value.replace(/<p>&nbsp;<\/p>$/m, '')
    if (!text || textLength(text) < 2) return false

    dispatch(createComment(postId, text))
    .then(({ error }) => {
      if (error) return
      trackEvent(ADDED_COMMENT, {post: {id: postId}})
    })

    return false
  }

  componentDidMount () {
    this.socket = getSocket()
  }

  render () {
    const {
      currentUser, dispatch, postId, text
    } = this.props
    const { isMobile } = this.context
    const updateStore = text => dispatch(updateCommentEditor(postId, text, true))

    const setText = event => updateStore(event.target.value)
    const placeholder = this.props.placeholder || 'Type a message...'

    const stoppedTyping = () => {
      if (this.socket) this.socket.post(socketUrl(`/noo/post/${postId}/typing`), { isTyping: false })
    }
    const startedTyping = () => {
      if (this.socket) this.socket.post(socketUrl(`/noo/post/${postId}/typing`), { isTyping: true })
    }

    const stopTyping = debounce(stoppedTyping, STOPPED_TYPING_WAIT_TIME)
    const startTyping = throttle(startedTyping, STARTED_TYPING_INTERVAL, {trailing: false})
    const handleKeyDown = e => {
      startTyping()
      onCmdOrCtrlEnter(e => {
        stoppedTyping()
        e.preventDefault()
        updateStore('')
        this.submit()
      }, e)
    }

    return <form onSubmit={this.submit} className='message-form'>
            <input type='text' ref='editor' name='message'
              value={text}
              placeholder={placeholder}
              onBlur={() => updateStore(this.refs.editor.value)}
              onChange={setText}
              onKeyUp={stopTyping}
              onKeyDown={handleKeyDown}/>
    </form>
  }
}

