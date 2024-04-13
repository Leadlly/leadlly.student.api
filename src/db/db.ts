import mongoose from "mongoose";

const ConnectToDB = async() =>{
    const DatabaseUrl = process.env.DATABASE_URL
    if(!DatabaseUrl){ 
        console.log("Database url is undefined")
        return
    }
        
    try {
        await mongoose.connect(DatabaseUrl, {
             dbName: "leadlly"
        })
        console.log('MognoDB Connected.')
    } catch (error) {
        console.log(error)
    }
}

export default ConnectToDB