import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let db: mongoose.Connection;
const ConnectToDB = async () => {
  const DatabaseUrl = process.env.LEADLLY_DB_URL;
  if (!DatabaseUrl) {
    console.log("Leadlly_DB url is undefined");
    return;
  }
  try {
    await mongoose.connect(DatabaseUrl);
    db = mongoose.connection
    console.log("Leadlly_DB Connected.");
  } catch (error) {
    console.log(error);
  }
};

//question_db_connection
let questions_db: mongoose.Connection;
const questions_db_url = process.env.LEADLLY_QUESTIONS_DB_URL;
if (questions_db_url) {
  questions_db = mongoose.createConnection(questions_db_url);
} else {
  console.log("Question_DB url is undefined");
}

export { questions_db, db };
export default ConnectToDB;
