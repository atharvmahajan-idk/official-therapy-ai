import { createClient } from 'redis';

const RedisClient = createClient({
    username: 'default',
    password: 'UnNB5I4rFOjL6T4D6Jg3jNAILv1CX0vx',
    socket: {
        host: 'redis-10776.c330.asia-south1-1.gce.redns.redis-cloud.com',
        port: 10776
    }
});

RedisClient.on('error', err => console.log('Redis Client Error', err));

export {RedisClient}

