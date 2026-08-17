import { v2 as cloudinary } from "cloudinary";

let isConfigured = false;

export function getCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    isConfigured = true;
    return cloudinary;
  }
  return null;
}

export async function uploadToCloudinary(fileBuffer: Buffer, folder = "veltora"): Promise<string> {
  const client = getCloudinary();
  if (!client || !isConfigured) {
    console.warn("Cloudinary not configured. Simulating image storage upload.");
    // Fallback to random unsplash high-quality mehndi category placeholder
    const mockImages = [
      "https://images.unsplash.com/photo-1610030469668-93535c17b6b3?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&w=600&h=600&q=80",
      "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?auto=format&fit=crop&w=600&h=600&q=80"
    ];
    return mockImages[Math.floor(Math.random() * mockImages.length)];
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image"
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload failed:", error);
          reject(error);
        } else {
          resolve(result?.secure_url || "");
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
}
