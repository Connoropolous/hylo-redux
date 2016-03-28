import React from 'react'
import { filter, find, first, get, isEmpty, map, pick, some, without, includes } from 'lodash'
const { array, bool, func, object } = React.PropTypes
import cx from 'classnames'
import { humanDate, nonbreaking, present, sanitize, timeRange, timeRangeFull, appendInP } from '../util/text'
import truncate from 'html-truncate'
import A from './A'
import Avatar from './Avatar'
import Dropdown from './Dropdown'
import ClickCatchingDiv from './ClickCatchingDiv'
import Comment from './Comment'
import CommentForm from './CommentForm'
import RSVPControl from './RSVPControl'
import PersonDropdownItem from './PersonDropdownItem'
import { connect } from 'react-redux'
import { compose } from 'redux'
import {
  changeEventResponse,
  followPost,
  removePost,
  startPostEdit,
  voteOnPost
} from '../actions'
import { same } from '../models'
import decode from 'ent/decode'

const spacer = <span>&nbsp; •&nbsp; </span>

class Post extends React.Component {
  static propTypes = {
    post: object,
    communities: array,
    comments: array,
    commentsLoaded: bool,
    dispatch: func,
    commentingDisabled: bool,
    currentUser: object
  }

  static contextTypes = {
    community: object
  }

  static childContextTypes = {
    currentUser: object,
    dispatch: func,
    post: object
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  getChildContext () {
    return pick(this.props, 'currentUser', 'dispatch', 'post')
  }

  render () {
    let { post, communities, comments, commentingDisabled } = this.props
    let community
    if (this.context.community) {
      community = this.context.community
    } else {
      community = communities[0]
    }

    let image = find(post.media, m => m.type === 'image')
    var classes = cx('post', post.type, {image: !!image})

    const createdAt = new Date(post.created_at)

    let title = decode(post.name || '')
    let person = post.type === 'welcome'
      ? post.relatedUsers[0]
      : post.user

    return <div className={classes}>
      <div className='header'>
        <PostMenu/>
        <Avatar person={person}/>
        {post.type === 'welcome'
          ? <WelcomePostHeader communities={communities}/>
          : <div>
              <A className='name' to={`/u/${person.id}`}>{person.name}</A>
              {spacer}
              <span className='meta'>
                <A to={`/p/${post.id}`}>{nonbreaking(humanDate(createdAt))}</A>
                &nbsp;in {community.name}
              </span>
            </div>}
      </div>

      <p className='title'>{title}</p>
      {post.type === 'event' && <EventSection/>}
      {post.location && <Location/>}
      {image && <img src={image.url} className='post-section full-image'/>}
      <PostDetails {...{comments, communities, commentingDisabled}}/>
    </div>
  }
}

export const UndecoratedPost = Post // for testing

export default compose(
  connect((state, { post }) => {
    const { comments, commentsByPost, people } = state
    const commentIds = get(commentsByPost, post.id)
    const communities = get(post.communities, '0.id')
      ? post.communities
      : map(post.communities, id => find(state.communities, same('id', {id})))

    return {
      commentsLoaded: !!commentIds,
      comments: map(commentIds, id => comments[id]),
      currentUser: get(people, 'current'),
      communities
    }
  })
)(Post)

const EventSection = (props, { post }) => {
  const start = new Date(post.start_time)
  const end = post.end_time && new Date(post.end_time)
  const eventTime = timeRange(start, end)
  const eventTimeFull = timeRangeFull(start, end)

  return <p title={eventTimeFull} className='post-section event-time'>
    <i className='glyphicon glyphicon-time'></i>
    {eventTime}
  </p>
}
EventSection.contextTypes = {post: object}

const Location = (props, { post }) => {
  return <p title='location' className='post-section post-location'>
    <i className='glyphicon glyphicon-map-marker'></i>
    {post.location}
  </p>
}
Location.contextTypes = {post: object}

const WelcomePostHeader = ({ communities }, { post }) => {
  let person = post.relatedUsers[0]
  let community = communities[0]
  return <div>
    <strong><A to={`/u/${person.id}`}>{person.name}</A></strong> joined
    <span> </span>
    {community
      ? <span>
          <A to={`/c/${community.slug}`}>{community.name}</A>.
          <span> </span>
          <a className='open-comments'>
            Welcome them!
          </a>
        </span>
      : <span>
          a community that is no longer active.
        </span>}
  </div>
}
WelcomePostHeader.contextTypes = {post: object}

const PostMenu = (props, { dispatch, post, currentUser }) => {
  let canEdit = same('id', currentUser, post.user)
  let following = some(post.followers, same('id', currentUser))

  const edit = () => dispatch(startPostEdit(post))
  const remove = () => window.confirm('Are you sure? This cannot be undone.') &&
    dispatch(removePost(post.id))

  return <Dropdown className='post-menu' alignRight={true}
    toggleChildren={<i className='glyphicon glyphicon-option-horizontal'></i>}>
    {canEdit && <li><a onClick={edit}>Edit</a></li>}
    {canEdit && <li><a onClick={remove}>Remove</a></li>}
    <li>
      <a onClick={() => dispatch(followPost(post.id, currentUser))}>
        Turn {following ? 'off' : 'on'} notifications for this post
      </a>
    </li>
    <li>
      <a onClick={() => window.alert('TODO')}>Report objectionable content</a>
    </li>
  </Dropdown>
}
PostMenu.contextTypes = Post.childContextTypes

const PostDetails = (props, { post, currentUser, dispatch }) => {
  const { comments, commentingDisabled } = props
  const typeLabel = `#${post.type === 'chat' ? 'all-topics' : post.type}`
  const description = present(appendInP(
    sanitize(post.description), ` <a class='hashtag'>${typeLabel}</a>`))
  const attachments = filter(post.media, m => m.type !== 'image')

  return <div className='post-details'>
    {description && <ClickCatchingDiv className='details post-section'
      dangerouslySetInnerHTML={{__html: description}}/>}

    {post.type === 'event' && <EventRSVP postId={post.id} responders={post.responders}/>}
    <div className='voting post-section'>
      <VoteButton /><Voters />
    </div>

    {!isEmpty(attachments) && <div className='post-section'>
      {attachments.map((file, i) =>
        <a key={i} className='attachment' href={file.url} target='_blank' title={file.name}>
          <img src={file.thumbnail_url}/>
          {truncate(file.name, 40)}
        </a>)}
    </div>}

    <CommentSection {...{post, comments, commentingDisabled}}/>
  </div>
}
PostDetails.contextTypes = Post.childContextTypes

class CommentSection extends React.Component {
  static propTypes = {
    comments: array,
    commentingDisabled: bool
  }

  static contextTypes = {post: object}

  constructor (props) {
    super(props)
    this.state = {expanded: false}
  }

  toggleExpanded = () => {
    this.setState({expanded: !this.state.expanded})
  }

  render () {
    let { comments, commentingDisabled } = this.props
    let { post } = this.context
    let { expanded } = this.state
    if (!comments) comments = []
    let displayedComments = expanded ? comments : comments.slice(0, 3)
    return <div className={cx('comments-section', 'post-section', {'empty': isEmpty(comments)})}>
      <a name={`post-${post.id}-comments`}></a>
        {displayedComments.map(c =>
          <Comment comment={{...c, post_id: post.id}} key={c.id}/>)}
      {comments.length > 3 && !expanded && <div className='show-all'>
          <a onClick={this.toggleExpanded}>Show all</a>
        </div>}
      {!commentingDisabled && <CommentForm postId={post.id}/>}
    </div>
  }
}

const EventRSVP = ({ postId, responders }, { currentUser, dispatch }) => {
  let isCurrentUser = r => r.id === get(currentUser, 'id')
  let currentResponse = get(find(responders, isCurrentUser), 'response') || ''
  let onPickResponse = currentUser &&
    (choice => dispatch(changeEventResponse(postId, choice, currentUser)))

  return <RSVPControl {...{responders, currentResponse, onPickResponse}}/>
}
EventRSVP.contextTypes = {currentUser: object, dispatch: func}

export const VoteButton = (props, { post, currentUser, dispatch }) => {
  let vote = () => dispatch(voteOnPost(post, currentUser))
  let myVote = includes(map(post.voters, 'id'), (currentUser || {}).id)
  return <a className='vote-button' onClick={vote}>
    <i className={`icon-heart-new${myVote ? '-selected' : ''}`}></i>
    {myVote ? 'Liked' : 'Like'}
  </a>
}
VoteButton.contextTypes = Post.childContextTypes

export const Voters = (props, { post, currentUser }) => {
  let { voters } = post
  if (!voters) voters = []

  let onlyAuthorIsVoting = voters.length === 1 && same('id', first(voters), post.user)
  let meInVoters = find(voters, same('id', currentUser))
  let otherVoters = meInVoters ? without(voters, meInVoters) : voters

  let numShown = 2
  let num = otherVoters.length
  let hasHidden = num > numShown
  let separator = threshold =>
    num > threshold
      ? ', '
      : num === threshold
        ? `${voters.length === 2 ? '' : ','} and `
        : ''

  if (voters.length > 0 && !onlyAuthorIsVoting) {
    return <span className='voters meta'>
      {meInVoters && <span className='voter'>You</span>}
      {meInVoters && separator(1)}
      {otherVoters.slice(0, numShown).map((person, index) =>
        <span className='voter' key={person.id}>
          <a href={`/u/${person.id}`}>{person.name}</a>
          {index !== numShown - 1 && separator(2)}
        </span>)}
      {hasHidden && ', and '}
      {hasHidden && <Dropdown className='inline'
        toggleChildren={<span>
          {num - numShown} other{num - numShown > 1 ? 's' : ''}
        </span>}>
        {otherVoters.slice(numShown).map(p =>
          <PersonDropdownItem key={p.id} person={p}/>)}
      </Dropdown>}
      &nbsp;liked this.
    </span>
  } else {
    return <span />
  }
}
Voters.contextTypes = {post: object, currentUser: object}
