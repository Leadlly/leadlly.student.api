import Redis from 'ioredis'

export const connectToRedis = () => {

    const redisUri = process.env.REDIS_URI || ''
    console.log(redisUri)
    let redis = new Redis(redisUri);
    redis.on('connect', () => console.log('Redis Connected.'));
    redis.on('error', (err) => {
        console.log('Redis Client Error', err);
        redis.disconnect(); // Disconnect from Redis
    });
}


export default connectToRedis
