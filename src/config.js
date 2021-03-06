import { parse } from 'url'
import { once } from 'lodash'

export const environment = process.env.NODE_ENV || 'development'
const isServer = typeof window === 'undefined'

if (isServer && environment === 'development') {
  require('dotenv').load({silent: true})
}

export const filepickerKey = process.env.FILEPICKER_API_KEY
export const logLevel = process.env.LOG_LEVEL
export const upstreamHost = process.env.UPSTREAM_HOST
export const socketHost = process.env.SOCKET_HOST
export const host = process.env.HOST
export const slack = {
  clientId: process.env.SLACK_APP_CLIENT_ID
}
export const s3 = {
  bucket: process.env.AWS_S3_BUCKET,
  host: process.env.AWS_S3_HOST
}
export const google = {
  key: process.env.GOOGLE_BROWSER_KEY,
  clientId: process.env.GOOGLE_CLIENT_ID
}
export const facebook = {
  appId: process.env.FACEBOOK_APP_ID
}
export const segment = {
  writeKey: process.env.SEGMENT_KEY
}

export const featureFlags = () => {
  if (isServer) {
    return once(() =>
      Object.keys(process.env).reduce((flags, key) => {
        if (key.startsWith('FEATURE_FLAG_')) {
          flags[key.replace('FEATURE_FLAG_', '')] = process.env[key]
        }
        return flags
      }, {}))()
  } else {
    return window.FEATURE_FLAGS
  }
}

const config = {
  environment, filepickerKey, logLevel, upstreamHost, host, slack, s3, google,
  facebook, segment, featureFlags
}

if (!upstreamHost || !parse(upstreamHost).protocol) {
  throw new Error(`bad value for UPSTREAM_HOST: ${upstreamHost}`)
}

if (!isServer) window.__appConfig = config

export default config
