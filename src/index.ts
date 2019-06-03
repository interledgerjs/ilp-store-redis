import * as IoRedis from 'ioredis'

export interface StoreOptions {
  prefix?: string
  [propName: string]: any
}

class RedisStore {
  _prefix: string
  _redis: IoRedis.Redis

  constructor (opts: StoreOptions) {
    this._prefix = 'ilp:' + (opts.prefix || '') + ':'
    const redisOptions = Object.assign({ keyPrefix: this._prefix }, opts)
    delete(redisOptions.prefix)
    this._redis = new IoRedis(redisOptions)
  }

  async get (key: string): Promise<string | undefined> {
    const value = await this._redis.get(key)
    return (value === null) ? undefined : value
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
