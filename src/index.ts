const Redis = require('ioredis')

export interface StoreOptions {
  prefix?: string
  [propName: string]: any
}

class RedisStore {
  _prefix: string
  _redis: any

  constructor (opts: StoreOptions) {
    this._prefix = 'ilp:' + (opts.prefix || '') + ':'
    this._redis = new Redis(Object.assign({ keyPrefix: this._prefix }, opts))
  }

  async get (key: string): Promise<string | undefined> {
    return this._redis.get(key) || undefined
  }

  async put (key: string, value: string): Promise<undefined> {
    return this._redis.pipeline()
      .set(key, String(value))
      .publish(this._prefix + key, value)
      .exec()
  }

  async del (key: string): Promise<undefined> {
    return this._redis.pipeline()
      .del(key)
      .publish(this._prefix + ':' + key, '')
      .exec()
  }
}

export default RedisStore
