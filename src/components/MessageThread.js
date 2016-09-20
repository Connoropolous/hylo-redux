import React from 'react'
import { get } from 'lodash/fp'
const { array, bool, func, object, string } = React.PropTypes
import cx from 'classnames'
import {
  humanDate, nonbreaking, present, textLength, truncate, appendInP
} from '../util/text'
import MessageSection from './MessageSection'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { getComments, getCommunities } from '../models/post'
import { getCurrentCommunity } from '../models/community'
import config from '../config'
import decode from 'ent/decode'

const spacer = <span>&nbsp; •&nbsp; </span>

class MessageThread extends React.Component {
  static propTypes = {
    post: object,
    communities: array,
    community: object,
    messages: array,
    dispatch: func,
  }

  static childContextTypes = {post: object}

  getChildContext () {
    return {post: this.props.post}
  }

  render () {
    const { post, messages } = this.props
    const classes = cx('dm')

    return <div className={classes}>
      <Header />
      <MessageSection {...{post, messages}}/>
    </div>
  }
}

export default compose(
  connect((state, { post }) => {
    return {
      messages: getComments(post, state),
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
