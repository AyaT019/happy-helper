/**
 * organizeStickers.js
 *
 * Strategy:
 * 1. Delete the 367 stickers we bulk-imported (they have no useful names or categories)
 * 2. Upload each local image from "sb sticky/<folder>/" to Cloudinary (or reuse existing URL)
 * 3. Create a properly-named, properly-categorised Sticker in MongoDB
 * 4. Set price = 0.500 for all
 *
 * Because the Cloudinary assets have random IDs and cannot be matched to local filenames,
 * we re-upload everything fresh and clean up the old entries.
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { Sticker } from './src/models/Sticker.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Maps folder name → category label + emoji ─────────────────────────────────
const CATEGORY_MAP = {
    'aesthetic': { category: 'Aesthetic', emoji: '🌸' },
    'anime': { category: 'Anime', emoji: '⛩️' },
    'chess': { category: 'Chess', emoji: '♟️' },
    'memes-Uni Chaos': { category: 'Memes & Uni Chaos', emoji: '😂' },
    'tounsi': { category: 'Tounsi', emoji: '🇹🇳' },
};

const SB_STICKY_DIR = path.join(__dirname, '..', 'sb sticky');
const PRICE = 0.5;

function slugToName(filename) {
    // Remove extension, replace dashes/underscores/dots with spaces, trim
    return path.basename(filename, path.extname(filename))
        .replace(/[-_]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

async function uploadToCloudinary(filePath, folderName) {
    const result = await cloudinary.uploader.upload(filePath, {
        folder: `stickyy/${folderName}`,
        resource_type: 'image',
        transformation: [{ width: 800, height: 800, crop: 'limit' }],
    });
    return result.secure_url;
}

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // ── Step 1: Delete all old "Recovered" stickers ────────────────────────────
    const deleted = await Sticker.deleteMany({ category: 'Recovered' });
    console.log(`\n🗑  Deleted ${deleted.deletedCount} old "Recovered" stickers`);

    // ── Step 2: Process each folder ───────────────────────────────────────────
    let totalCreated = 0;
    let totalFailed = 0;

    for (const [folderName, meta] of Object.entries(CATEGORY_MAP)) {
        const folderPath = path.join(SB_STICKY_DIR, folderName);
        if (!fs.existsSync(folderPath)) {
            console.warn(`\n⚠️  Folder not found, skipping: ${folderPath}`);
            continue;
        }

        const files = fs.readdirSync(folderPath).filter(f => {
            const ext = path.extname(f).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
        });

        console.log(`\n📁 ${folderName} → ${meta.category} (${files.length} images)`);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const filePath = path.join(folderPath, file);
            const name = slugToName(file);

            process.stdout.write(`  [${i + 1}/${files.length}] Uploading "${name}"... `);

            try {
                const imgUrl = await uploadToCloudinary(filePath, folderName);

                await Sticker.create({
                    name,
                    price: PRICE,
                    category: meta.category,
                    categories: [meta.category],
                    emoji: meta.emoji,
                    img: imgUrl,
                    badge: '',
                    packOnly: false,
                });

                console.log('✅');
                totalCreated++;
            } catch (err) {
                console.log(`❌ ${err.message}`);
                totalFailed++;
            }
        }
    }

    console.log(`\n🎉 Done!`);
    console.log(`   ✅ Created : ${totalCreated} stickers`);
    console.log(`   ❌ Failed  : ${totalFailed} stickers`);
    console.log('\nAll stickers are priced at 0.500 DT and organised into 5 categories:');
    Object.values(CATEGORY_MAP).forEach(m => console.log(`   • ${m.emoji} ${m.category}`));
    process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
