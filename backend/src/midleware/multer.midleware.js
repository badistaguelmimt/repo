import multer from "multer";
import path from "path";

// Génère un nom de fichier unique pour éviter les collisions sur le serveur.
// On conserve l'extension d'origine si elle est dans la liste des formats autorisés.
const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname || "").toLowerCase();
        const safeExt = [".jpeg", ".jpg", ".png", ".webp"].includes(ext) ? ext : "";
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${safeExt}`);
    },
});

// Refuse tout fichier qui n'est pas une image JPEG, PNG ou WebP
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);

    if (extname && mimeType) {
        cb(null, true);
    } else {
        cb(new Error("Format de fichier non autorisé. Formats acceptés : jpeg, jpg, png, webp"), false);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo maximum
});