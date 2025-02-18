import { S3Client } from "@aws-sdk/client-s3";
import AWS from "aws-sdk";

const s3Client = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY as string,
        secretAccessKey: process.env.AWS_S3_SECRET_KEY as string,
    },
    region: "ca-central-1", // AWS region
});

// AWS SDK configuration
AWS.config.update({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY as string,
    secretAccessKey: process.env.AWS_S3_SECRET_KEY as string,
    signatureVersion: "v4",
    region: "ca-central-1",
});

export const legacyS3Client = new AWS.S3();
export default s3Client;
