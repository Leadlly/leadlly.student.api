import express, { urlencoded } from 'express';
import { config } from 'dotenv';
import serverless from 'serverless-http';
import cookieParser from 'cookie-parser';
import cors from 'cors';

config({
    path: './.env'
});

const app = express();

app.use(cookieParser())
app.use(express.json())
app.use(urlencoded({extended: true}))
app.use(cors())

// Your Express routes
app.get('/', (req, res) => {
    res.send('Hello, world!');
});

// Wrap your express app with serverless-http
const handler = serverless(app);

export { app, handler };
