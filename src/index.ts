const Redis = require('ioredis')

export interface StoreOptions {
  path: string
  [propName: string]: any
}

class RedisStore {
  _path: string
  _redis: any

  constructor (opts: StoreOptions) {
    this._path = 'ilp:' + (opts.path || '')
    this._redis = new Redis(Object.assign({ keyPrefix: this._path }, opts))
  }

  async get (key: string): Promise<string | undefined> {
    return this._redis.get(key) || undefined
  }

  async put (key: string, value: string): Promise<undefined> {
    return this._redis.pipeline()
      .set(key, String(value))
      .publish(this._path + ':' + key, value)
      .exec()
  }

  async del (key: string): Promise<undefined> {
    return this._redis.pipeline()
      .del(key)
      .publish(this._path + ':' + key, '')
      .exec()
  }
}

export default RedisStore
