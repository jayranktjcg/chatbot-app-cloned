import { AppDataSource } from "@Config/connection";
import { ChatMessage } from "@Entity/ChatMessage";
import { Directories } from "@Entity/Directories";
import logger from "@Utils/winston.logger";
import { EntityManager, In } from "typeorm";

const directoryRepo = AppDataSource.getRepository(Directories);
const chatMessageRepo = AppDataSource.getRepository(ChatMessage);

// Create Directory or File
export const createDirectory = async (data: any, userId: number) => {
    const { type, name, parentId = 0, messageId } = data;

    if (type === "file" && !messageId) {
        throw new Error("File cannot be empty.");
    }

    const existingItem = await directoryRepo.findOneBy({ parent_id: parentId, name, type });
    if (existingItem) throw new Error(`${type} with the same name already exists.`);

    const directory = directoryRepo.create({ user_id: userId, parent_id: parentId, name, type, message_id: type === "file" ? messageId : null });
    return await directoryRepo.save(directory);
};

// Update Directory or File
export const updateDirectory = async (id: number, data: any) => {
    const directory = await directoryRepo.findOneBy({ id });
    if (!directory) throw new Error("Directory/File not found.");

    directory.name = data.name;
    return await directoryRepo.save(directory);
};

// Delete Directory or File
export const deleteDirectory = async (id: number) => {
    /* const directory = await directoryRepo.findOneBy({ id });
    if (!directory) throw new Error("Directory/File not found.");

    directory.deleted_at = new Date();
    return await directoryRepo.save(directory); */

    // Step 1: Find the directory
    const directory = await directoryRepo.findOneBy({ id });
    if (!directory) throw new Error("Directory/File not found.");

    // Step 2: If it's a file, delete it directly
    if (directory.type === "file") {
        directory.deleted_at = new Date();
        await directoryRepo.save(directory);
        return { type: "file" };
    }

    // Step 3: If it's a directory, find and delete all subdirectories recursively
    return await AppDataSource.transaction(async (entityManager: EntityManager) => {
        const allSubDirectories: number[] = [];

        // Recursive function to get all sub-directory IDs
        const getSubDirectories = async (parentId: number) => {
            const subDirectories = await entityManager.find(Directories, { where: { parent_id: parentId } });
            for (const subDir of subDirectories) {
                allSubDirectories.push(subDir.id);
                await getSubDirectories(subDir.id); // Recursive call
            }
        };

        // Get all subdirectories recursively
        await getSubDirectories(id);

        // Include the main directory itself
        allSubDirectories.push(id);

        // Step 4: Soft delete all directories & subdirectories
        await entityManager.update(Directories, { id: In(allSubDirectories) }, { deleted_at: new Date() });

        return { type: "directory" };
    });
};

// Move File
export const moveFile = async (id: number, data: any) => {
    const file = await directoryRepo.findOneBy({ id, type: "file" });
    if (!file) throw new Error("File not found.");

    file.parent_id = data.newParentId;
    return await directoryRepo.save(file);
};

// List Directories and Files
export const listDirectory = async (parentId: number, userId: number, page: number, limit: number) => {
    const offset = (page - 1) * limit;

    // Get paginated items
    const directories = await directoryRepo.find({ 
        where: { parent_id: parentId, user_id: userId }, 
        skip: offset, 
        take: limit 
    });

    // Fetch count of files and subdirectories inside each directory
    const directoriesWithCounts = await Promise.all(directories.map(async (directory) => {
        const totalFiles = await directoryRepo.count({ where: { parent_id: directory.id, user_id: userId } });
        return { ...directory, totalFiles };
    }));

    return directoriesWithCounts;
};

/**
 * Fetches the details of a file by its ID.
 * @param id - File ID
 * @returns File data (message and intent)
 */
export const getFileDetails = async (id: number): Promise<{ message: string; intent: string } | null> => {
    try {
        logger.info("Fetching file details", { module: "DirectoryModule", fileId: id });

        // Check if the file exists
        const fileExists = await directoryRepo.findOneBy({ id, type: "file" });

        if (!fileExists) {
            logger.warn("File not found", { module: "DirectoryModule", fileId: id });
            throw new Error("File not found.");
        }

        // Fetch file content from ChatMessage table

        const fileData = await chatMessageRepo.findOne({
            where: {
                id: Number(fileExists?.message_id),
            },
            select: ["message", "intent"],
        })

        if (!fileData) {
            logger.warn("No associated content found for the file", { module: "DirectoryModule", messageId: fileExists.message_id });
            throw new Error("Associated content not found for this file.");
        }

        logger.info("File details fetched successfully", { module: "DirectoryModule", fileId: id, data: fileData });

        return fileData;
    } catch (error: any) {
        logger.error("Error fetching file details", {
            module: "DirectoryModule",
            fileId: id,
            error: error.message,
        });
        throw new Error(error.message || "An unexpected error occurred while fetching file details.");
    }
};