import React from 'react'
import { get } from 'lodash/fp'
const { array, bool, func, object, string } = React.PropTypes
import cx from 'classnames'
import {
  humanDate, nonbreaking, present, textLength, truncate, appendInP
} from '../util/text'
import { sanitize } from 'hylo-utils/text'
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

class MessageThread extends React.Component {
  static propTypes = {
    post: object,
    communities: array,
    community: object,
    comments: array,
    dispatch: func,
    commentId: string
  }

  static childContextTypes = {post: object}

  getChildContext () {
    return {post: this.props.post}
  }

  render () {
    const { post, communities, comments, community } = this.props
    const classes = cx('dm')

    return <div className={classes}>
      <Header />
      <CommentSection {...{post, comments}} expanded={true} showNames={true}/>
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
)(MessageThread)

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
