import { app } from "./app";
import ConnectToDB from "./db/db";

const port = process.env.PORT || 4000

ConnectToDB()
app.listen(port, () => console.log(`server is listening at port ${port}`))