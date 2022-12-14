import Redis from 'ioredis';

export class Storage {
  static key = (key: string) => `porter:${key}`;

  private redis: Redis;

  constructor() {
    this.redis = new Redis(`${process.env.REDIS_URL}`);
  }

  get = async (id: string) => {
    const key = Storage.key(id);
    return JSON.parse((await this.redis.get(key)) || 'null');
  };

  put = async (id: string, data: { [key: string]: any }, expire?: Date | null) => {
    const key = Storage.key(id);
    // default: expire after 30min
    const date = ((now) => expire || new Date(now.setMinutes(now.getMinutes() + 30)))(new Date());
    const sec = Math.floor((Number(date) - Number(new Date())) / 1000);
    if (sec < 0) throw new Error('Expired in the past.');
    await this.redis.setex(key, sec, JSON.stringify(data));
  };

  clear = async (id: string) => {
    await this.redis.del(id);
  };
}
