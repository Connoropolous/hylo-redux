import React from 'react'
import cx from 'classnames'
import { connect } from 'react-redux'
import { find } from 'lodash'
import TopNav from '../components/TopNav'
import { LeftNav, leftNavWidth, leftNavEasing } from '../components/LeftNav'
import Notifier from '../components/Notifier'
import LiveStatusPoller from '../components/LiveStatusPoller'
import PageTitleController from '../components/PageTitleController'
import { logout, navigate, removeNotification, toggleMainMenu, updateUserSettings } from '../actions'
import { makeUrl } from '../client/util'
import { VelocityComponent } from 'velocity-react'
import { canInvite, canModerate } from '../models/currentUser'
import { isMobile } from '../client/util'
import { get, pick } from 'lodash'
const { array, bool, func, object, string } = React.PropTypes

@connect((state, { params: { id } }) => {
  const { notifierMessages } = state
  const currentUser = state.people.current
  const leftNavSetting = get(currentUser, 'settings.leftNavIsOpen')
  const community = find(state.communities, c => c.id === state.currentCommunityId)
  const tags = community ? state.tagsByCommunity[community.slug] : {}
  const leftNavIsOpen = isMobile() || leftNavSetting === undefined
    ? state.leftNavIsOpen : leftNavSetting

  return {
    leftNavIsOpen,
    notifierMessages,
    currentUser,
    community,
    tags,
    path: state.routing.path
  }
})
export default class App extends React.Component {
  static propTypes = {
    children: object,
    community: object,
    currentUser: object,
    leftNavIsOpen: bool,
    tags: object,
    notifierMessages: array,
    path: string,
    dispatch: func
  }

  static childContextTypes = {
    dispatch: func,
    currentUser: object
  }

  getChildContext () {
    return pick(this.props, 'dispatch', 'currentUser')
  }

  render () {
    const {
      children,
      community,
      currentUser,
      dispatch,
      tags,
      leftNavIsOpen,
      notifierMessages
    } = this.props

    const path = this.props.path.split('?')[0]

    const moveWithMenu = {marginLeft: leftNavIsOpen ? leftNavWidth : 0}
    const toggleLeftNav = open => {
      dispatch(toggleMainMenu())
      if (!isMobile() && currentUser) {
        dispatch(updateUserSettings(currentUser.id, {settings: {leftNavIsOpen: open}}))
      }
    }
    const openLeftNav = () => toggleLeftNav(true)
    const closeLeftNav = () => toggleLeftNav(false)
    const doSearch = text => dispatch(navigate(makeUrl('/search', {q: text})))
    const visitCommunity = community =>
      dispatch(navigate(nextPath(path, community)))

    return <div className={cx({leftNavIsOpen})}>
      <TopNav currentUser={currentUser}
        community={community}
        onChangeCommunity={visitCommunity}
        openLeftNav={openLeftNav}
        leftNavIsOpen={leftNavIsOpen}
        logout={() => dispatch(logout())}
        path={path}
        search={doSearch}/>
      <LeftNav opened={leftNavIsOpen}
        community={community}
        tags={tags}
        canModerate={canModerate(currentUser, community)}
        canInvite={canInvite(currentUser, community)}
        close={closeLeftNav}/>

      <VelocityComponent animation={moveWithMenu} easing={leftNavEasing}>
        {children}
      </VelocityComponent>

      <Notifier messages={notifierMessages}
        remove={id => dispatch(removeNotification(id))}/>
      <LiveStatusPoller/>
      <PageTitleController/>
    </div>
  }
}

const nextPath = (path, community) => {
  const pathStart = community ? `/c/${community.slug}` : ''
  const match = community
    ? path.match(/(events|projects|members|about|invite|notifications)$/)
    : path.match(/(events|projects|notifications)$/)
  const pathEnd = match ? `/${match[1]}` : ''

  return pathStart + pathEnd
}
