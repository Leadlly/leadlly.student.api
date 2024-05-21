"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.questions_db = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ConnectToDB = async () => {
    const DatabaseUrl = process.env.LEADLLY_DB_URL;
    if (!DatabaseUrl) {
        console.log("Leadlly_DB url is undefined");
        return;
    }
    try {
        await mongoose_1.default.connect(DatabaseUrl);
        console.log("Leadlly_DB Connected.");
    }
    catch (error) {
        console.log(error);
    }
};
//question_db_connection
let questions_db;
const questions_db_url = process.env.LEADLLY_QUESTIONS_DB_URL;
if (questions_db_url) {
    exports.questions_db = questions_db = mongoose_1.default.createConnection(questions_db_url);
}
else {
    console.log("Question_DB url is undefined");
}
exports.default = ConnectToDB;
