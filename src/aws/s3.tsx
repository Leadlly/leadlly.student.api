import { S3Client, S3ClientConfig } from "@aws-sdk/client-s3";

const s3Config: S3ClientConfig = {
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_KEY || "",
    accessKeyId: process.env.AWS_ACCESS_KEY || "",
  },
};

const s3 = new S3Client(s3Config);

export default s3;
