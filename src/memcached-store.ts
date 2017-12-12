import * as Memcached from 'memcached'

export interface IMemcachedStoreOptions {
  expiration: number,
  prefix?: string,
  client?: any,
}

export default class MemcachedStore {
  public prefix: string
  public expiration: number
  public client: any

  constructor(options: IMemcachedStoreOptions) {
    this.prefix = options.prefix || 'rl:'
    this.expiration = options.expiration || 60 * 15
    this.client = options.client || new Memcached(['127.0.0.1:11211'])
  }

  public incr(key: string, cb: any): void {
    this.client.increment(`${this.prefix}${key}`, 1, (err: any, result: boolean|number) => {
      if (err) { return cb(err, null) }

      if (result === false) {
        this.client.set(`${this.prefix}${key}`, 1, this.expiration, (ng: any, ok: boolean) => {
          if (ok === true) {
            cb(null, 1)
          } else {
            cb(ng, null)
          }
        })
      } else {
        cb(null, result)
      }
    })
  }

  public resetKey(key: string): void {
    this.client.del(`${this.prefix}${key}`)
  }
}