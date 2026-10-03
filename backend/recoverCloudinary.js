import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import { Sticker } from './src/models/Sticker.js';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function main() {
    if (!process.env.MONGODB_URI) {
        console.error("Error: MONGODB_URI is not defined in .env!");
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB...");

    try {
        let nextCursor = null;
        let totalRecovered = 0;
        console.log("Fetching images from Cloudinary...");

        do {
            const result = await cloudinary.api.resources({
                type: 'upload',
                resource_type: 'image',
                max_results: 500,
                next_cursor: nextCursor,
            });

            const resources = result.resources || [];
            nextCursor = result.next_cursor;

            console.log(`Analyzing ${resources.length} assets in this batch...`);

            for (const res of resources) {
                const url = res.secure_url;

                // Ensure this image isn't already inside the database
                const exists = await Sticker.findOne({ img: url });
                if (!exists) {
                    const rawName = res.public_id.split('/').pop() || 'Recovered Asset';

                    // Make the name look nice (replace underscores/dashes with spaces)
                    const name = rawName.replace(/[\-_]/g, ' ');

                    await Sticker.create({
                        name: name,
                        price: 5,
                        category: "Recovered",
                        categories: ["Recovered"],
                        img: url,
                        emoji: "📸",
                    });
                    totalRecovered++;
                }
            }
        } while (nextCursor);

        console.log(`\n🎉 Success! Added ${totalRecovered} new missing stickers from Cloudinary into your Stickyy database.`);
        console.log("They are all placed in a category named 'Recovered' with a default price of 5.");
        console.log("You can now go to your Admin panel, rename them, edit their prices, and change their categories!");
    } catch (err) {
        console.error("Error recovering assets:", err);
    } finally {
        process.exit(0);
    }
}

main();
