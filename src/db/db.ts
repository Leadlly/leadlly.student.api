import mongoose from "mongoose";
import dotenv from 'dotenv'

dotenv.config()

const ConnectToDB = async() =>{
    const DatabaseUrl = process.env.LEADLLY_DB_URL
    console.log(DatabaseUrl)
    if(!DatabaseUrl){ 
        console.log("Leadlly_DB url is undefined")
        return
    }
        
    try {
        await mongoose.connect(DatabaseUrl)
        console.log('Leadlly_DB Connected.')
    } catch (error) {
        console.log(error)
    }
}

//question_db_connection
const questions_db_url = process.env.LEADLLY_QUESTIONS_DB_URL;

if (!questions_db_url) {
  throw new Error("Question_DB url is undefined");
}
const questions_db = mongoose.createConnection(questions_db_url);

export {questions_db}
export default ConnectToDB