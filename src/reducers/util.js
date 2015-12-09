import { filter, uniq } from 'lodash'

// for pagination -- append a new page of data to existing data if present,
// removing any duplicates.
export function appendUniq (state, key, data) {
  let existing = state[key] || []
  return {
    ...state,
    [key]: uniq(existing.concat(data), (v, i) => v.id)
  }
}

export function addIdsToState (state, key, objects) {
  return {
    ...state,
    [key]: uniq((state[key] || []).concat(objects.map(p => p.id)))
  }
}

export function hashById (objects, transform) {
  return objects.reduce((m, x) => {
    m[x.id] = transform ? transform(x) : x
    return m
  }, {})
}

// for modifying a post, project, or other object with a list of media;
// set an item of specified type if url is set, and remove it otherwise.
// assumes that there is can be only one item of specified type, so it
// should be used with images and videos in the current implementation
// but not docs.
export function updateMedia (obj, type, url) {
  let media = filter(obj && obj.media, m => m.type !== type)
  if (url) media = media.concat({type, url})
  return {...obj, media}
}
