import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function main() {
    // List all top-level folders
    console.log("=== CLOUDINARY FOLDERS ===");
    const { folders } = await cloudinary.api.root_folders();
    for (const f of folders) {
        console.log(`📁 ${f.name} (path: ${f.path})`);
        try {
            const sub = await cloudinary.api.sub_folders(f.path);
            for (const s of sub.folders) {
                console.log(`   📂 ${s.path}`);
            }
        } catch (_) { }
    }

    console.log("\n=== SAMPLE ASSETS (first 20) ===");
    const res = await cloudinary.api.resources({ type: 'upload', resource_type: 'image', max_results: 20 });
    for (const r of res.resources) {
        console.log(`  public_id: ${r.public_id}`);
    }
}

main().catch(console.error).finally(() => process.exit(0));
