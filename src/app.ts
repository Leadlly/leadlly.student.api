import express from 'express';
import { config } from 'dotenv';
import serverless from 'serverless-http';

config({
    path: './.env'
});

const app = express();

// Your Express routes
app.get('/', (req, res) => {
    res.send('Hello, world!');
});

// Wrap your express app with serverless-http
const handler = serverless(app);

export { app, handler };
