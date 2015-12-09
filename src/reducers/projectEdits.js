import {
  CREATE_PROJECT,
  REMOVE_IMAGE,
  UPDATE_PROJECT_EDITOR,
  UPDATE_PROJECT_VIDEO,
  UPLOAD_IMAGE
} from '../actions'
import { updateMedia } from './util'

export default function (state = {}, action) {
  if (action.error) return state

  let { type, payload, meta } = action
  let { subject, id } = meta || {}
  switch (type) {
    case CREATE_PROJECT:
      return {...state, [id]: null}
    case UPDATE_PROJECT_EDITOR:
      return {...state, [id]: {...state[id], ...payload}}
    case UPDATE_PROJECT_VIDEO:
      return {
        ...state,
        [id]: updateMedia(state[id], 'video', payload)
      }
    case UPLOAD_IMAGE:
    case REMOVE_IMAGE:
      if (subject === 'project') {
        return {
          ...state,
          [id]: updateMedia(state[id], 'image', payload)
        }
      }
      break
  }

  return state
}
