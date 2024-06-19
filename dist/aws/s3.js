"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const s3Config = {
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_KEY || "",
    accessKeyId: process.env.AWS_ACCESS_KEY || "",
  },
};
const s3 = new client_s3_1.S3Client(s3Config);
exports.default = s3;
