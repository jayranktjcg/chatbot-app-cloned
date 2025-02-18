import path from "path";
import fs from "fs";
import multer from "multer";
import multerS3 from "multer-s3";
import { DeleteObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import s3Client, { legacyS3Client } from "@Config/aws";
import { randomString } from "./function";
import { constants } from "@Constant/constant";
import { ENV } from "@Config/env";

const UPLOAD_IN = ENV.UPLOAD_IN || "local";
const MAX_FILE_SIZE = 25 * 1024 * 1024;

export const uploadFile = async (key: string) => {
    let storage: multer.StorageEngine;
    let filePathPrefix: string | undefined;

    if (UPLOAD_IN === "aws") {
        // S3 storage configuration
        storage = multerS3({
            s3: s3Client,
            bucket: process.env.BUCKET_FOLDER_NAME as string,
            acl: "public-read",
            metadata: (req, file, cb) => {
                cb(null, { fieldname: file.fieldname });
            },
            key: async (req, file, cb) => {
                const fileExtension = path.extname(file.originalname).toLowerCase();
                const fileName = `${key}/${Date.now()}${await randomString(8)}${fileExtension}`;
                filePathPrefix = fileName;
                cb(null, fileName);
            },
        });
    } else if (UPLOAD_IN === "local") {
        // Local storage configuration
        storage = multer.diskStorage({
            destination: async (req, file, cb) => {
                const destinationDir = path.join(constants.UPLOAD_DIR, key);

                if (!fs.existsSync(destinationDir)) {
                    fs.mkdirSync(destinationDir, { recursive: true });
                }
                cb(null, destinationDir);
            },
            filename: async (req, file, cb) => {
                const fileExtension = path.extname(file.originalname).toLowerCase();
                const fileName = `${Date.now()}${await randomString(8)}${fileExtension}`;
                filePathPrefix = fileName;
                cb(null, fileName);
            },
        });
    } else {
        throw new Error("Invalid storage type specified");

    }

    return multer({
        storage: storage,
        limits: { fileSize: MAX_FILE_SIZE }, // ✅ Set file size limit here (25MB)
        fileFilter: (req, file, callback) => {
            sanitizeFile(file, callback)
        },
    });
};

export const sanitizeFile = (file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Check if the file's MIME type is allowed
    const isAllowed = constants.ALLOWED_MIME_TYPE.includes(file.mimetype);
    if (!isAllowed) {
        return cb(new Error("File type not allowed!"));
    }

    cb(null, true); // Accept the file
};

export const deleteFile = async (filePath: string) => {
    const fileArray = filePath.split("/");

    if (fileArray.length === 3 && fileArray[0] === "local") {
        const localFilePath = path.join("uploads", fileArray[1], fileArray[2]);
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
    } else {
        const params = {
            Bucket: process.env.BUCKET_NAME as string,
            Key: filePath,
        };
        const command = new DeleteObjectCommand(params);
        await s3Client.send(command);
    }
    return true;
};

export const deleteMultipleFiles = async (filePaths: string[]) => {
    for (const key of filePaths) {
        const fileArray = key.split("/");

        if (fileArray.length === 3 && fileArray[0] === "local") {
            const localFilePath = path.join("uploads", fileArray[1], fileArray[2]);
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath);
            }
        } else {
            const params = {
                Bucket: process.env.BUCKET_NAME as string,
                Key: key,
            };
            const command = new DeleteObjectCommand(params);
            await s3Client.send(command);
        }
    }
    return true;
};

export const awsSignedUrl = async (key: string, expires: number = 603000) => {
    return legacyS3Client.getSignedUrlPromise("getObject", {
        Key: key,
        Bucket: process.env.BUCKET_NAME as string,
        Expires: expires,
    });
};
