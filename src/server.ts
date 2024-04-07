import { app } from "./app";
import ConnectToDB from "./db/db";
import connectToRedis from "./services/redis";
import { v2 as cloudinary } from "cloudinary";

const port = process.env.PORT || 4000

//Database
ConnectToDB()

//Services
connectToRedis()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });


app.listen(port, () => console.log(`Server is listening at port ${port}`))