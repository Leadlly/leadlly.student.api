import { app } from "./app";
import ConnectToDB from "./db/db";
import { connectToRedis } from "./services/redis";
import { questions_db } from "./db/db";

const port = process.env.PORT || 4000

//Database
ConnectToDB()
questions_db.on("connected", () => {
  console.log("Question_DB connected");
});

//Services
connectToRedis()

app.listen(port, () => console.log(`Server is listening at port ${port}`))