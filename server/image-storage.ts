import fs from "fs";
import path from "path";
import type { Request, Response } from "express";
import { db } from "./db";
import { storedImages } from "@shared/schema";
import { eq } from "drizzle-orm";

const IMAGES_DIR = path.resolve("generated", "images");
fs.mkdirSync(IMAGES_DIR, { recursive: true });

export async function saveImage(filename: string, buffer: Buffer): Promise<string> {
  const localPath = path.join(IMAGES_DIR, filename);
  fs.writeFileSync(localPath, buffer);

  try {
    await db
      .insert(storedImages)
      .values({ filename, data: buffer, mimeType: "image/png" })
      .onConflictDoUpdate({
        target: storedImages.filename,
        set: { data: buffer, mimeType: "image/png" },
      });
    console.log(`Image stored in database: ${filename} (${(buffer.length / 1024).toFixed(0)}KB)`);
  } catch (err: any) {
    console.error(`Failed to store image in database: ${filename}: ${err.message}`);
  }

  return `/generated/images/${filename}`;
}

export async function deleteImage(filename: string): Promise<void> {
  const localPath = path.join(IMAGES_DIR, filename);
  if (fs.existsSync(localPath)) {
    fs.unlinkSync(localPath);
  }

  try {
    await db.delete(storedImages).where(eq(storedImages.filename, filename));
    console.log(`Deleted image from database: ${filename}`);
  } catch (err: any) {
    console.warn(`Failed to delete image from database: ${filename}: ${err.message}`);
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

  try {
    const [row] = await db
      .select()
      .from(storedImages)
      .where(eq(storedImages.filename, filename))
      .limit(1);

    if (row?.data) {
      const buffer = Buffer.from(row.data);
      fs.writeFileSync(localPath, buffer);

      res.set("Content-Type", row.mimeType || "image/png");
      res.set("Cache-Control", "public, max-age=86400");
      return res.send(buffer);
    }
  } catch (err: any) {
    console.warn(`Failed to fetch image from database: ${filename}: ${err.message}`);
  }

  res.status(404).send("Image not found");
}
