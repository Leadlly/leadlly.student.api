import mongoose from "mongoose";

const ConnectToDB = async() =>{
    const DatabaseUrl: string = process.env.DATABASE_URL || ''
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