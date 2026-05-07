import { v2 as cloudinary } from "cloudinary";
import { ENV } from "./env.js";

// Configure le SDK Cloudinary avec les identifiants du projet.
// Cloudinary est utilisé pour stocker et servir les images (animaux, produits, profils).
cloudinary.config({
    cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
    api_key: ENV.CLOUDINARY_API_KEY,
    api_secret: ENV.CLOUDINARY_API_SECRET,
});

export default cloudinary;