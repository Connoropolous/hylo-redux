import React from 'react'
import Dropdown from './Dropdown'
import { host } from '../config'

let share = href => {
  window.FB.ui({
    method: 'share',
    href: href
  }, function (response) {})
}

export const SharingDropdown = props => {
  let { url, text, ...otherProps } = props
  let origin = typeof window !== 'undefined' ? window.location.origin : host
  let absoluteUrl = `${origin}/${url}`
  var twitterText = text
  let max = 100
  if (twitterText.length > max) {
    twitterText = twitterText.substring(0, max - 3) + '...'
  }
  twitterText + ' via Hylo:'
  return <Dropdown {...otherProps}>
    <li><a onClick={() => share(absoluteUrl)}>Facebook</a></li>
    <li><a href={`https://twitter.com/intent/tweet?text=${twitterText}&url=${absoluteUrl}`}>Twitter</a></li>
  </Dropdown>
}

export default SharingDropdown
