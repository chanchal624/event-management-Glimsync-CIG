import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(
  buffer: Buffer,
  folder: string,
  fileName: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `glimsync/${folder}`,
        public_id: fileName.split(".")[0],
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          reject(error);
        } else if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error("Cloudinary upload failed: No result returned"));
        }
      }
    );

    uploadStream.end(buffer);
  });
}

export async function deleteFromCloudinary(url: string): Promise<any> {
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    
    const pathAndExt = parts[1].replace(/^v\d+\//, "");
    const publicId = pathAndExt.substring(0, pathAndExt.lastIndexOf("."));

    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary destroy error:", error);
    throw error;
  }
}
