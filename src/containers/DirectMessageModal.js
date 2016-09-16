import React from 'react'
import { connect } from 'react-redux'
import { getCurrentCommunity, getFollowedTags } from '../models/community'
import { closeModal } from '../actions'
import { modalWrapperCSSId, Modal } from '../components/Modal'
import { newestMembership } from '../models/currentUser'
const { array, bool, func, number, object, string } = React.PropTypes

@connect(state => {
  const community = getCurrentCommunity(state) ||
    newestMembership(state.people.current).community
  return {
    community
  }
})
export default class DirectMessageModal extends React.Component {
  static propTypes = {
    dispatch: func,
    userId: string,
    community: object,
    onCancel: func
  }

  render () {
    const {
      community, userId, dispatch, onCancel
    } = this.props
    const title = 'You and Monique'

    return <Modal {...{title}} id='direct-message' onCancel={onCancel} >
      <p>write a message</p>
    </Modal>
  }
}
