import { app } from "./app";
import ConnectToDB from "./db/db";
import { connectToRedis } from "./services/redis";

const port = process.env.PORT || 4000

//Database
ConnectToDB()

//Services
connectToRedis()

app.listen(port, () => console.log(`Server is listening at port ${port}`))