import { Worker } from 'bullmq'
import redis from '../redis';

export const myWorker = new Worker('myqueue', async (job) => {
    // await sendMail(job, next)
}, { connection: redis });