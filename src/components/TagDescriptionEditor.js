import React from 'react'
import { connect } from 'react-redux'
import { cancelTagDescriptionEdit, editTagDescription, editNewTagAndDescription } from '../actions'
import { debounce, keys, isEmpty, map } from 'lodash'
import { get } from 'lodash/fp'
import { hashtagWordRegex } from '../models/hashtag'
import { getCurrentCommunity } from '../models/community'
import { canModerate } from '../models/currentUser'
import { BareModalWrapper, Modal } from './Modal'
import ModalRow, { ModalInput } from './ModalRow'
import cx from 'classnames'
const { func, object, bool } = React.PropTypes

@connect((state, props) => ({
  tags: state.tagDescriptionEdits,
  creating: state.creatingTagAndDescription,
  currentUser: get('people.current', state),
  community: getCurrentCommunity(state)
}))
export default class TagDescriptionEditor extends React.Component {
  static propTypes = {
    tags: object,
    saveParent: func,
    saveTagDescriptions: func,
    updatePostTag: func,
    dispatch: func,
    creating: bool,
    currentUser: object,
    community: object
  }

  render () {
    let {
      tags, saveParent, updatePostTag, dispatch, creating, currentUser, community
    } = this.props
    const cancel = () => dispatch(cancelTagDescriptionEdit())
    const editAction = creating ? editNewTagAndDescription : editTagDescription
    const edit = debounce((tag, value, is_default) =>
      dispatch(editAction(tag, value, is_default)), 200)

    if (isEmpty(tags)) {
      if (!creating) return null
      tags = {'': {description: '', is_default: false}}
    }

    const validate = tags => {
      // only called when creating a tag so we can assume there is exactly one tag
      let tag = keys(tags)[0]
      if (tag[0].match(/[^A-Za-z]/)) {
        window.alert('Topic names must start with a letter')
        return false
      } else if (tag.length < 2) {
        window.alert('Topic names must be at least 2 characters')
        return false
      } else if (!tag.match(hashtagWordRegex)) {
        window.alert('Topic names can only use letters, numbers and underscores, with no spaces.')
        return false
      }
      return true
    }
    const createTag = () => {
      if (!validate(tags)) return
      updatePostTag(tags)
      cancel()
    }

    const title = `Hey, you're creating ${keys(tags).length > 1 ? 'new topics.' : 'a new topic.'}`

    return <BareModalWrapper>
      <Modal id='tag-description-editor' title={title} onCancel={cancel}>
        {map(tags, ({ description, is_default }, tag) =>
          <div key={creating ? 'key' : tag} className={cx('tag-group', {creating})}>
            {creating
              ? <ModalInput label='Topic name' defaultValue={tag}
              onChange={event => edit(event.target.value, description, is_default)}/>
              : <div className='topic'>
                  <label>Topic name</label>
                  <span>#{tag}</span>
                </div>}
            <ModalInput label='Description' defaultValue={description}
              onChange={event => edit(tag, event.target.value, is_default)}/>
            {canModerate(currentUser, community) && <ModalRow
              ref='default'>
              <label>Make default</label>
              <input type='checkbox'
                value='def'
                defaultChecked={is_default}
                onChange={event => edit(tag, description, !is_default)}
                onFocus={() => this.refs.default.focus()}
                onBlur={() => this.refs.default.blur()}/>
              Make this a default topic for your community.
            </ModalRow>}
          </div>)}
        <div className='footer'>
          <button onClick={creating ? createTag : () => saveParent(tags)}
            className='ok'>
            Create
          </button>
        </div>
      </Modal>
    </BareModalWrapper>
  }
}
