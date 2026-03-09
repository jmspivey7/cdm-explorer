import fs from "fs";
import path from "path";
import type { Request, Response } from "express";

const IMAGES_DIR = path.resolve("generated", "images");
fs.mkdirSync(IMAGES_DIR, { recursive: true });

let objectStorageClient: any = null;
let lastInitAttempt = 0;
const INIT_RETRY_INTERVAL = 30000;

async function getObjectStorageClient() {
  if (objectStorageClient) return objectStorageClient;

  const now = Date.now();
  if (now - lastInitAttempt < INIT_RETRY_INTERVAL) return null;
  lastInitAttempt = now;

  try {
    const { Client } = await import("@replit/object-storage");
    objectStorageClient = new Client();
    console.log("Object Storage client initialized");
    return objectStorageClient;
  } catch (err: any) {
    console.warn("Object Storage not available, using local filesystem only:", err.message);
    return null;
  }
}

export async function saveImage(filename: string, buffer: Buffer): Promise<string> {
  const localPath = path.join(IMAGES_DIR, filename);
  fs.writeFileSync(localPath, buffer);

  const client = await getObjectStorageClient();
  if (client) {
    const key = `images/${filename}`;
    const maxRetries = 3;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await client.uploadFromBytes(key, buffer);
        console.log(`Image uploaded to Object Storage: ${key} (${(buffer.length / 1024).toFixed(0)}KB)`);
        break;
      } catch (err: any) {
        console.error(`Object Storage upload attempt ${attempt + 1}/${maxRetries} failed for ${key}: ${err.message}`);
        if (attempt < maxRetries - 1) {
          await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
        } else {
          console.error(`All Object Storage upload attempts failed for ${key} — image saved locally only`);
        }
      }
    }
  }

  return `/generated/images/${filename}`;
}

export async function deleteImage(filename: string): Promise<void> {
  const localPath = path.join(IMAGES_DIR, filename);
  if (fs.existsSync(localPath)) {
    fs.unlinkSync(localPath);
  }

  const client = await getObjectStorageClient();
  if (client) {
    try {
      const key = `images/${filename}`;
      await client.delete(key);
      console.log(`Deleted from Object Storage: ${key}`);
    } catch (err: any) {
      console.warn(`Failed to delete from Object Storage: ${filename}: ${err.message}`);
    }
  }
}

export async function serveImage(req: Request, res: Response) {
  const filename = req.params.filename || req.params[0];
  if (!filename || filename.includes("..") || filename.includes("/")) {
    return res.status(400).send("Invalid filename");
  }

  const localPath = path.join(IMAGES_DIR, filename);
  if (fs.existsSync(localPath)) {
    res.set("Cache-Control", "public, max-age=86400");
    return res.sendFile(localPath);
  }

  const client = await getObjectStorageClient();
  if (client) {
    try {
      const key = `images/${filename}`;
      const result = await client.downloadAsBytes(key);
      if (result && result.value) {
        const buffer = Buffer.from(result.value);
        fs.writeFileSync(localPath, buffer);

        res.set("Content-Type", "image/png");
        res.set("Cache-Control", "public, max-age=86400");
        return res.send(buffer);
      }
    } catch (err: any) {
      console.warn(`Image not found in Object Storage: ${filename}`);
    }
  }

  res.status(404).send("Image not found");
}
