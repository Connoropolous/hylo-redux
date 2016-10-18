require('../support')
import SinglePost from '../../src/containers/SinglePost'
import { fetchPost, unfollowPost } from '../../src/actions/posts'
import { configureStore } from '../../src/store'
import { renderToString } from 'react-dom/server'
import cheerio from 'cheerio'
import { getPrefetchedData } from 'react-fetcher'
import { createElement, mockActionResponse } from '../support/helpers'

const bob = {id: '2', name: 'bob'}
const eva = {id: '5', name: 'eva'}
const post = {id: '1', name: 'foo', user_id: bob.id, follower_ids: [eva.id]}

describe('SinglePost', () => {
  describe('with action=unfollow query param', () => {
    var component, store, params, query

    before(() => {
      store = configureStore({
        people: {current: eva}
      }).store
      store.dispatch = spy(store.dispatch)
      mockActionResponse(fetchPost(post.id), {...post, people: [bob]})
      mockActionResponse(unfollowPost(post.id, eva.id), {})
      params = {id: post.id}
      query = {action: 'unfollow'}
      const props = {params, query, location: {query, search: '?action=unfollow'}}
      component = createElement(SinglePost, props, {store})
    })

    it('unfollows the post', () => {
      return getPrefetchedData([SinglePost], {
        store, params, query, dispatch: store.dispatch
      })
      .then(() => {
        renderToString(component)
        const state = store.getState()
        expect(state.posts[post.id].follower_ids).to.be.empty
        const message = state.notifierMessages[0]
        expect(message).to.exist
        expect(message.type).to.equal('info')
        expect(message.text).to.equal('Notifications for this post are now off.')
      })
    })
  })
})
