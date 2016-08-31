import React from 'react'
import { get } from 'lodash/fp'
const { array, bool, func, object, string } = React.PropTypes
import cx from 'classnames'
import {
  humanDate, nonbreaking, present, textLength, truncate, appendInP
} from '../util/text'
import { sanitize } from 'hylo-utils/text'
import { linkifyHashtags } from '../util/linkify'
import { tagUrl } from '../routes'
import A from './A'
import Avatar from './Avatar'
import CommentSection from './CommentSection'
import LazyLoader from './LazyLoader'
import Icon from './Icon'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { getComments, getCommunities, isPinned } from '../models/post'
import { getCurrentCommunity } from '../models/community'
import { isMobile } from '../client/util'
import config from '../config'
import decode from 'ent/decode'

const spacer = <span>&nbsp; •&nbsp; </span>

class MessagePost extends React.Component {
  static propTypes = {
    post: object,
    communities: array,
    community: object,
    comments: array,
    dispatch: func,
    expanded: bool,
    onExpand: func,
    commentId: string
  }

  static childContextTypes = {post: object}

  getChildContext () {
    return {post: this.props.post}
  }

  render () {
    const { post, communities, comments, community } = this.props
    const classes = cx('post')
    const title = linkifyHashtags(decode(sanitize(post.name || '')), get('slug', community))

    return <div className={classes}>
      <a name={`post-${post.id}`}></a>
      <Header />
      <p className='title post-section' dangerouslySetInnerHTML={{__html: title}}></p>
      <CommentSection {...{post, comments}} showNames={true}/>
    </div>
  }
}

export default compose(
  connect((state, { post }) => {
    return {
      comments: getComments(post, state),
      communities: getCommunities(post, state),
      community: getCurrentCommunity(state)
    }
  })
)(MessagePost)

export const Header = (props, { post }) => {
  const followers = post.followers
  const beyondTwo = followers.length - 2
  const title = followers.length > 2 ?
    `You, ${followers[1].name}, and ${beyondTwo} other${beyondTwo == 1 ? '' : 's'}` :
    `You and ${followers[1].name}`

  return <div className='header'>
    <div className='title'>{title}</div>
  </div>
}
Header.contextTypes = {post: object}
