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
import { threadUrl } from '../routes'
import { FETCH_THREADS, markThreadRead, fetchThreads } from '../actions'
import { getCurrentCommunity } from '../models/community'
import { denormalizedPost, getComments } from '../models/post'
const { array, bool, func, number, object } = React.PropTypes
import decode from 'ent/decode'
import A from '../components/A'
import { NonLinkAvatar } from '../components/Avatar'
import Dropdown from '../components/Dropdown'
import Icon from '../components/Icon'

export const ThreadsDropdown = connect(
  (state, props) => {
    return { 
      threads: map(m => denormalizedPost(m, state), values(state.threads)),
      pending: state.pending[FETCH_THREADS]
    }
  }
)(props => {
  const { threads, dispatch, pending } = props
  const newCount = 1
  return <Dropdown alignRight rivalrous='nav' className='thread-list'
    onFirstOpen={() => dispatch(fetchThreads())}
    toggleChildren={<span>
      <Icon name='Message-Smile'/>
      {newCount > 0 && <div className='badge'>{newCount}</div>}
    </span>}>
    {!pending && <li className='top'>
      <div className='newMessage' onClick={() => {}}>
        <Icon name='Compose'/><span>New Message</span>
      </div>
    </li>}
    {pending && <li className='loading'>Loading...</li>}
    {threads.slice(0, 20).map(thread => <li key={thread.id}>
      <Thread thread={thread}/>
    </li>)}
    {!pending && <li className='bottom'>
      <a>See all</a>
    </li>}
  </Dropdown>
})

const Thread = ({ thread, latestComment }, { currentUser, dispatch }) => {
  const comment = thread.comments[0]
  const unread = true
  const { followers } = thread
  const follower = followers.find(f => f.id !== currentUser.id)
  if (!follower) return null
  const markAsRead = () => unread && dispatch(markThreadRead(id))

  return <A to={threadUrl(thread.id)} className={cx({unread})}
    onClick={markAsRead}>
    {unread && <div className='dot-badge'/>}
    <NonLinkAvatar person={follower}/>
    <span>
      <strong>{ follower.name }</strong>&nbsp;
      { comment ? comment.text : '' }
    </span>
  </A>
}
Thread.contextTypes = {
  dispatch: func,
  currentUser: object 
}
