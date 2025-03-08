import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";
import { prismaClient } from "./prisma-client";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (
  file: Express.Multer.File,
  folder: string
) => {
  const base64 = await file.buffer.toString("base64");
  const result = await cloudinary.uploader.upload(
    `data:${file.mimetype};base64,${base64}`,
    {
      folder,
    }
  );
  return result;
};

export const deleteImage = async (public_id: string, image_id: string) => {
  const result = await cloudinary.uploader.destroy(public_id);
  await prismaClient.image.delete({
    where: {
      id: image_id,
    },
  });
  return result;
};
