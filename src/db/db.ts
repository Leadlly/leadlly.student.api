import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let db: mongoose.Connection;
const ConnectToDB = async () => {
  const DatabaseUrl = process.env.LEADLLY_DB_URL as string;

  try {
   
    await mongoose.connect(DatabaseUrl);
    db = mongoose.connection; 
    console.log("Leadlly_DB Connected.");
  } catch (error) { 
    console.log(error);
  }
};

//question_db_connection
let questions_db: mongoose.Connection;
const questions_db_url = process.env.LEADLLY_QUESTIONS_DB_URL as string;
questions_db = mongoose.createConnection(questions_db_url);

export { questions_db, db };
export default ConnectToDB;
