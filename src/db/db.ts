import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let db: mongoose.Connection;
let questions_db: mongoose.Connection;

const ConnectToDB = async () => {
  const DatabaseUrl = process.env.LEADLLY_DB_URL as string;
  const questionsDbUrl = process.env.LEADLLY_QUESTIONS_DB_URL as string;

  try {
    await mongoose.connect(DatabaseUrl, {
      autoIndex: true, // Enable automatic index creation
    });
    db = mongoose.connection;
    console.log("Leadlly_DB Connected.");

    questions_db = await mongoose.createConnection(questionsDbUrl);
    console.log("Questions_DB Connected.");
  } catch (error) {
    console.log("Error connecting to databases:", error);
  }
};

export { questions_db, db };
export default ConnectToDB;
