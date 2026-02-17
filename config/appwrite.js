import { Client, Storage, ID } from "node-appwrite";

// Appwrite client setup
const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const storage = new Storage(client);

// Satu bucket untuk semua modul
const BUCKET_ID = process.env.APPWRITE_BUCKET_ID || "gmmi";

// Modul yang valid
const VALID_MODULES = ["carousel", "warta", "sejarah", "renungan"];

/**
 * Upload file ke Appwrite Storage
 * File name diawali prefix modul supaya terpisah secara logis di dalam 1 bucket
 * @param {string} moduleName - Nama modul (carousel, warta, sejarah, renungan)
 * @param {object} file - Multer file object (dari memoryStorage)
 * @returns {string} URL publik file yang diupload
 */
async function uploadFile(moduleName, file) {
  if (!VALID_MODULES.includes(moduleName)) {
    throw new Error(`Modul "${moduleName}" tidak valid.`);
  }

  const fileId = ID.unique();

  // Prefix filename dengan nama modul: carousel/image.png
  const prefixedName = `${moduleName}_${file.originalname}`;

  // Convert buffer to File for Appwrite SDK
  const blob = new Blob([file.buffer], { type: file.mimetype });
  const inputFile = new File([blob], prefixedName, { type: file.mimetype });

  await storage.createFile(BUCKET_ID, fileId, inputFile);

  // Generate public URL
  const endpoint =
    process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
  const projectId = process.env.APPWRITE_PROJECT_ID;
  const fileUrl = `${endpoint}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${projectId}`;

  return fileUrl;
}

/**
 * Hapus file dari Appwrite Storage
 * @param {string} moduleName - Nama modul (untuk logging)
 * @param {string} fileUrl - URL file yang disimpan di database
 */
async function deleteFile(moduleName, fileUrl) {
  try {
    if (!fileUrl) return;

    // Extract fileId dari URL: .../files/{fileId}/view?...
    const match = fileUrl.match(/\/files\/([^/]+)\/view/);
    if (!match) return;

    const fileId = match[1];
    await storage.deleteFile(BUCKET_ID, fileId);
  } catch (error) {
    console.error(
      `Gagal menghapus file dari Appwrite (${moduleName}):`,
      error.message,
    );
  }
}

export { uploadFile, deleteFile, BUCKET_ID };
