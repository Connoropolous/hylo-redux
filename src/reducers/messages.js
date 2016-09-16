import {
  FETCH_MESSAGES
} from '../actions'
import { mergeList } from './util'

export default function (state = {}, action) {
  const { error, type, payload, meta } = action
  if (error) return state

  switch (type) {
    case FETCH_MESSAGES:
      return mergeList(state, payload.posts, 'id')
  }
  return state
}
