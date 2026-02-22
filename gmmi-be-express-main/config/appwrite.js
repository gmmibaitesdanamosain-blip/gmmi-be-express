import { Client, Storage, ID } from "node-appwrite";

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const storage = new Storage(client);

const BUCKET_ID = process.env.APPWRITE_BUCKET_ID || "gmmi";

// ✅ Tambah "pewartaan" ke valid modules
const VALID_MODULES = ["carousel", "warta", "sejarah", "renungan", "pewartaan"];

async function uploadFile(moduleName, file) {
  if (!VALID_MODULES.includes(moduleName)) {
    throw new Error(`Modul "${moduleName}" tidak valid.`);
  }

  const fileId = ID.unique();
  const prefixedName = `${moduleName}_${file.originalname}`;

  const blob = new Blob([file.buffer], { type: file.mimetype });
  const inputFile = new File([blob], prefixedName, { type: file.mimetype });

  await storage.createFile(BUCKET_ID, fileId, inputFile);

  const endpoint = process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
  const projectId = process.env.APPWRITE_PROJECT_ID;
  const fileUrl = `${endpoint}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${projectId}`;

  return { url: fileUrl, fileId };
}

async function deleteFile(moduleName, fileUrl) {
  try {
    if (!fileUrl) return;
    const match = fileUrl.match(/\/files\/([^/]+)\/view/);
    if (!match) return;
    const fileId = match[1];
    await storage.deleteFile(BUCKET_ID, fileId);
  } catch (error) {
    console.error(`Gagal menghapus file dari Appwrite (${moduleName}):`, error.message);
  }
}

export { uploadFile, deleteFile, BUCKET_ID };