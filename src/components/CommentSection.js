import React from 'react'
import cx from 'classnames'
import {
  difference, filter, first, includes, isEmpty, map, some, sortBy, values
} from 'lodash'
import { find, get } from 'lodash/fp'
const { array, bool, func, object, string } = React.PropTypes
import config from '../config'
import PeopleTyping from './PeopleTyping'
import Comment from './Comment'
import CommentForm from './CommentForm'
import { appendComment } from '../actions'

export default class CommentSection extends React.Component {
  static propTypes = {
    comments: array,
    onExpand: func,
    post: object,
    showNames: bool,
    expanded: bool
  }

  static defaultProps = {
    onExpand: function () {}
  }

  static contextTypes = {
    community: object,
    currentUser: object,
    isProjectRequest: bool,
    dispatch: func,
    socket: object
  }

  componentDidMount () {
    const { post: { id}, expanded, comments } = this.props
    const { dispatch } = this.context
    if (expanded) {
      this.context.socket.post(`${config.upstreamHost}/noo/post/${id}/subscribe`)
      this.context.socket.on('commentAdded', function (comment){
        dispatch(appendComment(id, comment))
      })
    }
  }

  componentWillUnmount () {
    const { post: { id }, expanded } = this.props
    if (expanded) {
      this.context.socket.post(`${config.upstreamHost}/noo/post/${id}/unsubscribe`)
      this.context.socket.off('commentAdded')
    }
  }

  render () {
    let { post, comments, onExpand, expanded, showNames } = this.props
    const truncate = !expanded
    const { currentUser, community, isProjectRequest } = this.context

    if (!comments) comments = []
    comments = sortBy(comments, c => c.created_at)
    if (truncate) comments = comments.slice(-3)

    return <div className={cx('comments-section post-section', {empty: isEmpty(comments)})}>
      {truncate && post.numComments > comments.length && <div className='comment show-all'>
        <a onClick={() => onExpand()}>Show all {post.numComments} comments</a>
      </div>}
      {comments.map(c => <Comment comment={{...c, post_id: post.id}}
        truncate={truncate}
        expand={() => onExpand(c.id)}
        community={community}
        expanded={expanded}
        key={c.id}/>)}
      <PeopleTyping showNames={showNames}/>
      {currentUser && <CommentForm postId={post.id} />}
    </div>
  }
}
