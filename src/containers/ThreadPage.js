import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { get, includes } from 'lodash'
import { pick } from 'lodash/fp'
import {
  FETCH_POST, navigate, setMetaTags
} from '../actions'
import { fetchComments } from '../actions/comments'
import { fetchPost } from '../actions/posts'
import { saveCurrentCommunityId } from '../actions/util'
import { ogMetaTags } from '../util'
import A from '../components/A'
import { scrollToComment } from '../util/scrolling'
import { findError } from '../actions/util'
import AccessErrorMessage from '../components/AccessErrorMessage'
import Thread from '../components/Thread'
import { getCurrentCommunity } from '../models/community'
import { denormalizedPost, getComments, getPost } from '../models/post'
const { array, bool, object, string, func } = React.PropTypes


@prefetch(({ store, dispatch, params: { id }, query }) =>
  dispatch(fetchPost(id))
  .then(action => setupPage(store, id, query, action)))
@connect((state, { params: { id } }) => {
  const post = getPost(id, state)
  return {
    post: denormalizedPost(post, state),
    community: getCurrentCommunity(state),
    comments: getComments(post, state),
    editing: !!state.postEdits[id],
    error: findError(state.errors, FETCH_POST, 'posts', id)
  }
})
export default class ThreadPage extends React.Component {
  static propTypes = {
    post: object,
    community: object,
    editing: bool,
    error: string,
    dispatch: func,
    location: object
  }

  static childContextTypes = {
    community: object,
    communities: array,
    post: object,
    comments: array
  }

  static contextTypes = {
    isMobile: bool,
    currentUser: object
  }

  getChildContext () {
    return pick(['community', 'post', 'comments', 'communities'], this.props)
  }

  render () {
    const { post, community, editing, error, location: { query } } = this.props
    const { currentUser, isMobile } = this.context
    if (error) return <AccessErrorMessage error={error}/>
    if (!post || !post.user) return <div className='loading'>Loading...</div>
    const isChild = !!post.parent_post_id

    return <Thread post={post} />
  }
}

const setupPage = (store, id, query, action) => {
  const { error, payload, cacheHit } = action
  const { dispatch } = store
  if (error) return
  const state = store.getState()
  const post = state.posts[id]
  if (!post) return

  const communityId = get(post, 'communities.0') || 'all'
  const userId = get(state.people, 'current.id')

  if (payload && !payload.api) {
    const { name, description, media } = payload
    dispatch(setMetaTags(ogMetaTags(name, description, get(media, '0'))))
  }

  return Promise.all([
    saveCurrentCommunityId(dispatch, communityId, userId),
    dispatch(fetchComments(id)),
  ])
  .then(scroll) // must be deferred until after comments are loaded
}

const scroll = () => {
  if (typeof window === 'undefined') return
  let id = get(window.location.hash.match(/#comment-(\d+)$/), '1')
  if (id) scrollToComment(id)
}

