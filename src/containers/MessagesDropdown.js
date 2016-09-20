import React from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { defer, prefetch } from 'react-fetcher'
import { navigate } from '../actions'
import { values } from 'lodash'
import { get, map } from 'lodash/fp'
import cx from 'classnames'
import ScrollListener from '../components/ScrollListener'
import Avatar from '../components/Avatar'
import truncate from 'trunc-html'
import { humanDate } from '../util/text'
import { messageUrl } from '../routes'
import { getCurrentCommunity } from '../models/community'
import { denormalizedPost, getComments } from '../models/post'
const { array, bool, func, number, object } = React.PropTypes
import decode from 'ent/decode'
import A from '../components/A'
import { NonLinkAvatar } from '../components/Avatar'
import Dropdown from '../components/Dropdown'
import Icon from '../components/Icon'

export const MessagesDropdown = connect(
  (state, props) => {
    let messages = values(state.messages)
    messages = map(m => {
      return denormalizedPost(m, state)
    }, messages)
    return { messages }
  }
)(props => {
  const { messages, dispatch, pending } = props
  const newCount = 1
  return <Dropdown alignRight rivalrous='nav' className='messages-list'
    //onFirstOpen={() => dispatch(fetchActivity(0, true))}
    toggleChildren={<span>
      <Icon name='Message-Smile'/>
      {newCount > 0 && <div className='badge'>{newCount}</div>}
    </span>}>
    <li className='top'>
      <div className='newMessage' onClick={() => {}}>
        <Icon name='Compose'/><span>New Message</span>
      </div>
    </li>
    {pending && <li className='loading'>Loading...</li>}
    {messages.slice(0, 20).map(message => <li key={message.id}>
      <MessagesDropdownItem message={message}/>
    </li>)}
    {!pending && <li className='bottom'>
      <a>See all</a>
    </li>}
  </Dropdown>
})

const MessagesDropdownItem = ({ message, latestComment }, { currentUser, dispatch }) => {
  const comment = message.comments[0]
  const unread = true
  const { followers } = message
  const follower = followers.find(f => f.id !== currentUser.id)
  if (!follower) return null
  const markAsRead = () => unread && dispatch(markMessageRead(id))

  return <A to={messageUrl(message.id)} className={cx({unread})}
    onClick={markAsRead}>
    {unread && <div className='dot-badge'/>}
    <NonLinkAvatar person={follower}/>
    <span>
      <strong>{ follower.name }</strong>&nbsp;
      { comment ? comment.text : '' }
    </span>
  </A>
}
MessagesDropdownItem.contextTypes = {
  dispatch: func,
  currentUser: object 
}
