const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = 'mongodb+srv://fadisahlitn:JmYyHswW5l38cTBo@cluster0.3h9a6.mongodb.net/happy-helper?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferCommands: false
}).catch(err => console.error('MongoDB connection error:', err));

// Sticker Schema definition
const stickerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true, default: 0.500 },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
    cloudinaryId: { type: String, required: true },
    isFavorite: { type: Boolean, default: false },
    originalUrl: { type: String }, // For tracking the actual download URL if needed
    emoji: { type: String, default: '🖼️' },
    inStock: { type: Boolean, default: true }
}, {
    timestamps: true,
    collection: 'stickers'
});

const Sticker = mongoose.models.Sticker || mongoose.model('Sticker', stickerSchema);

const updates = [
    // Aesthetic
    { old: "téléchargement ($5).webp", name: "Green Frog Playing Banjo", category: "Aesthetic", emoji: "🐸" },
    { old: "téléchargement (1).webp", name: "Pompompurin Sleeping Bread", category: "Aesthetic", emoji: "🍮" },
    { old: "téléchargement (10).jpg", name: "Vincent van Gogh Starry Night Collage", category: "Aesthetic", emoji: "🌌" },
    { old: "téléchargement (16).jpg", name: "Cute Kitten Bread Loaf Hat", category: "Aesthetic", emoji: "🍞" },
    { old: "téléchargement (21).jpg", name: "Mona Lisa Bubble Gum", category: "Aesthetic", emoji: "🖼️" },
    { old: "téléchargement (22).jpg", name: "Renaissance Art Statue Face", category: "Aesthetic", emoji: "🗿" },
    { old: "téléchargement (25).jpg", name: "Sleeping Angel Child Cupid", category: "Aesthetic", emoji: "👼" },
    { old: "téléchargement (3).jpg", name: "Cinnamoroll Cute Dog Paws", category: "Aesthetic", emoji: "🐾" },
    { old: "téléchargement (3).webp", name: "My Melody Pink Hood", category: "Aesthetic", emoji: "🐰" },
    { old: "téléchargement (31).jpg", name: "Black Miffy Bunny Outline", category: "Aesthetic", emoji: "🐇" },
    { old: "téléchargement (32).jpg", name: "Snoopy Black and White Vintage", category: "Aesthetic", emoji: "🐾" },
    { old: "téléchargement (33).jpg", name: "Peanuts Snoopy Peeking", category: "Aesthetic", emoji: "🐶" },
    { old: "téléchargement (34).jpg", name: "Smiski Glow in the Dark Sitting", category: "Aesthetic", emoji: "✨" },
    { old: "téléchargement (35).jpg", name: "Smiski Glow Little Guy Looking", category: "Aesthetic", emoji: "🌠" },
    { old: "téléchargement (36).jpg", name: "Smiski Crouching Figure", category: "Aesthetic", emoji: "👽" },
    { old: "téléchargement (37).jpg", name: "Vintage Matchbox Cherry Blossom", category: "Aesthetic", emoji: "🌸" },
    { old: "téléchargement (38).jpg", name: "Green Frog Knife Meme", category: "Aesthetic", emoji: "🔪" },
    { old: "téléchargement (39).jpg", name: "Over the Garden Wall Beatrice Bird", category: "Aesthetic", emoji: "🐦" },
    { old: "téléchargement (40).jpg", name: "Maus Book Illustration Animal", category: "Aesthetic", emoji: "🐭" },
    { old: "téléchargement (41).jpg", name: "Pink Care Bear Retro", category: "Aesthetic", emoji: "💕" },
    { old: "téléchargement (42).jpg", name: "Gloomy Bear Pink Blood", category: "Aesthetic", emoji: "🐻" },
    { old: "téléchargement (43).jpg", name: "Care Bear Pink Holding Heart", category: "Aesthetic", emoji: "🧸" },
    { old: "téléchargement (44).jpg", name: "Kuromi Purple Skull Bow", category: "Aesthetic", emoji: "🖤" },
    { old: "téléchargement (49).jpg", name: "Greek Statue David Vaporwave", category: "Aesthetic", emoji: "🏛️" },
    { old: "téléchargement (5).webp", name: "Cinnamoroll Flower Crown", category: "Aesthetic", emoji: "🌺" },
    { old: "téléchargement (50).jpg", name: "Black Cat Curious Look", category: "Aesthetic", emoji: "🐈‍⬛" },
    { old: "téléchargement (51).jpg", name: "Ghost Pattern Cute Fall", category: "Aesthetic", emoji: "👻" },
    { old: "téléchargement (52).jpg", name: "Cat Outline Meow Kitten", category: "Aesthetic", emoji: "🐾" },
    { old: "téléchargement (53).jpg", name: "Turkish Coffee Cup Blue Pattern Top", category: "Aesthetic", emoji: "☕" },
    { old: "téléchargement (54).jpg", name: "Duck with Frog Hat", category: "Aesthetic", emoji: "🦆" },
    { old: "téléchargement (6).webp", name: "Cute Kitten Strawberry Costume", category: "Aesthetic", emoji: "🍓" },
    { old: "téléchargement (7).webp", name: "Oreo Cat Head Cute", category: "Aesthetic", emoji: "🍪" },
    { old: "téléchargement (8).jpg", name: "Tuxedo Cat Silly Blep", category: "Aesthetic", emoji: "👅" },
    { old: "téléchargement (9).jpg", name: "Vincent van Gogh Self Portrait", category: "Aesthetic", emoji: "🎨" },
    { old: "téléchargement.jpg", name: "Floral Postage Stamp 50 Cents", category: "Aesthetic", emoji: "✉️" },
    { old: "téléchargement00).jpg", name: "Junji Ito Spiral Hair Girl Uzumaki", category: "Anime", emoji: "🌀" },

    // Anime
    { old: "téléchargement (1).jpg", name: "Junji Ito Kirie Goshima Uzumaki Spirals", category: "Anime", emoji: "🌀" },
    { old: "téléchargement (10).jpg", name: "Luffy and Zoro One Piece Manga", category: "Anime", emoji: "☠️" },
    { old: "téléchargement (11).jpg", name: "Luffy Gear 5 Sun God Nika", category: "Anime", emoji: "☀️" },
    { old: "téléchargement (12).jpg", name: "One Piece Blue Skull Logo Rope", category: "Anime", emoji: "⚓" },
    { old: "téléchargement (13).jpg", name: "Chopper Lifting Hat One Piece", category: "Anime", emoji: "⚕️" },
    { old: "téléchargement (14).jpg", name: "Chopper Pink Hat with Antlers", category: "Anime", emoji: "🦌" },
    { old: "téléchargement (15).jpg", name: "Boa Hancock Wanted Poster", category: "Anime", emoji: "🐍" },
    { old: "téléchargement (16).jpg", name: "Sabo Luffy Ace Stacked Heads", category: "Anime", emoji: "🔥" },
    { old: "téléchargement (17).jpg", name: "Naruto Eating Ramen Chibi", category: "Anime", emoji: "🍜" },
    { old: "téléchargement (18).jpg", name: "Shizuku Murasaki Hunter x Hunter Club", category: "Anime", emoji: "🕷️" },
    { old: "téléchargement (19).jpg", name: "Shizuku Murasaki Spider Tattoo", category: "Anime", emoji: "🕸️" },
    { old: "téléchargement (2).jpg", name: "Nana Osaki Smoking Manga Black Stones", category: "Anime", emoji: "🚬" },
    { old: "téléchargement (21).jpg", name: "Shoyo Hinata Haikyuu Spike", category: "Anime", emoji: "🏐" },
    { old: "téléchargement (23).jpg", name: "Bakugo Katsuki My Hero Academia", category: "Anime", emoji: "💥" },
    { old: "téléchargement (24).jpg", name: "Kento Nanami Jujutsu Kaisen", category: "Anime", emoji: "👔" },
    { old: "téléchargement (3).jpg", name: "Maki Zenin Swinging Weapon JJK", category: "Anime", emoji: "🗡️" },
    { old: "téléchargement (4).jpg", name: "Nobara and Megumi Scoring 10 JJK", category: "Anime", emoji: "🔟" },
    { old: "téléchargement (4).webp", name: "Jiji Totoro No Face Ghibli Stack", category: "Anime", emoji: "🌱" },
    { old: "téléchargement (5$).jpg", name: "Kimi ni Todoke Sawako Kuronuma Panels", category: "Anime", emoji: "📞" },
    { old: "téléchargement (5).jpg", name: "Yuta Okkotsu Jujutsu Kaisen Sword", category: "Anime", emoji: "💍" },
    { old: "téléchargement (6).jpg", name: "Berserk Brand of Sacrifice", category: "Anime", emoji: "🩸" },
    { old: "téléchargement (7).jpg", name: "Toji Fushiguro Left It All Behind", category: "Anime", emoji: "🪱" },
    { old: "téléchargement (8).jpg", name: "Ryomen Sukuna and Finger JJK", category: "Anime", emoji: "👹" },
    { old: "téléchargement (9).jpg", name: "Kento Nanami Finish Your Work", category: "Anime", emoji: "⌚" },
    { old: "téléchargement_ (5).jpg", name: "Jujutsu Kaisen Cast Photo Strip", category: "Anime", emoji: "📸" },

    // Chess
    { old: "téléchargement (28).jpg", name: "Nice to Mate You Chess Pun", category: "Chess", emoji: "♟️" },

    // Memes-Uni Chaos
    { old: "téléchargement (1).jpg", name: "Absolut Vodka Bottle", category: "Memes", emoji: "🍸" },
    { old: "téléchargement (2).webp", name: "Warning Arabic Tired Student", category: "Memes", emoji: "⚠️" },
    { old: "téléchargement (27).jpg", name: "Don't Stop Sign Graffiti", category: "Memes", emoji: "🛑" },
    { old: "téléchargement (29).jpg", name: "Arabic Text Red Lines Notebook", category: "Memes", emoji: "📓" },
    { old: "téléchargement (35).jpg", name: "Young Dumb & Broke Typography", category: "Memes", emoji: "💸" },
    { old: "téléchargement (36).jpg", name: "Artistic Wordplay Typography", category: "Memes", emoji: "🎨" },
    { old: "téléchargement (38).jpg", name: "Spiderman Miles Morales Spidey Sense", category: "Memes", emoji: "🕷️" },
    { old: "téléchargement (41).jpg", name: "Among Us Impostor Text Pixel Art", category: "Memes", emoji: "🔪" },
    { old: "téléchargement (42).jpg", name: "Minecraft Totem of Undying", category: "Memes", emoji: "🔰" },
    { old: "téléchargement (43).jpg", name: "Minecraft Diamond Item", category: "Memes", emoji: "💎" },
    { old: "téléchargement (46).jpg", name: "Minecraft TNT Block", category: "Memes", emoji: "🧨" },
    { old: "téléchargement (47).jpg", name: "Red John Smiley Face The Mentalist", category: "Memes", emoji: "🩸" },
    { old: "téléchargement (48).jpg", name: "Marvel Logo Red Frame Text", category: "Memes", emoji: "🦸‍♂️" },
    { old: "téléchargement (8).webp", name: "Gumball and Darwin Annoyed Face", category: "Memes", emoji: "😒" },
    { old: "téléchargement (9).webp", name: "Darwin Happy Face Amazing World", category: "Memes", emoji: "🤩" },

    // Tounsi
    { old: "téléchargement (55).jpg", name: "Dried Red Chili Pepper Harissa", category: "Tounsi", emoji: "🌶️" }
];

async function run() {
    console.log('Connecting to database...');
    await new Promise(resolve => mongoose.connection.once('connected', resolve));
    console.log('Connected! Starting bulk update.');

    let matchCount = 0;
    let updateCount = 0;

    for (const update of updates) {
        const filter = { name: { $regex: escapeRegExp(update.old), $options: 'i' } };

        // First, let's see if we match anything
        const stickers = await Sticker.find(filter);

        if (stickers.length === 0) {
            // It's possible the original name in DB is exactly the filename, or maybe only URL has it?
            // Let's also check by imageUrl
            const urlFilter = { imageUrl: { $regex: escapeRegExp(encodeURI(update.old).replace(/[\(\)]/g, c => `\\${c}`)), $options: 'i' } };
            const urlStickers = await Sticker.find(urlFilter);
            if (urlStickers.length === 0) {
                // Fallback: try raw filename check in url just in case
                const rawUrlFilter = { imageUrl: { $regex: escapeRegExp(update.old), $options: 'i' } };
                const rawUrlStickers = await Sticker.find(rawUrlFilter);

                if (rawUrlStickers.length === 0) {
                    console.log(`Could not find sticker matching: ${update.old}`);
                    continue;
                } else {
                    for (const sticker of rawUrlStickers) {
                        matchCount++;
                        const updated = await Sticker.findByIdAndUpdate(sticker._id, {
                            $set: {
                                name: update.name,
                                emoji: update.emoji,
                                category: update.category,
                                price: 0.500
                            }
                        }, { new: true });
                        console.log(`Updated ${update.old} -> ${updated.name}`);
                        updateCount++;
                    }
                }
            } else {
                for (const sticker of urlStickers) {
                    matchCount++;
                    const updated = await Sticker.findByIdAndUpdate(sticker._id, {
                        $set: {
                            name: update.name,
                            emoji: update.emoji,
                            category: update.category,
                            price: 0.500
                        }
                    }, { new: true });
                    console.log(`Updated ${update.old} -> ${updated.name} (matched by encodeURI)`);
                    updateCount++;
                }
            }
        } else {
            for (const sticker of stickers) {
                matchCount++;
                const updated = await Sticker.findByIdAndUpdate(sticker._id, {
                    $set: {
                        name: update.name,
                        emoji: update.emoji,
                        category: update.category,
                        price: 0.500
                    }
                }, { new: true });
                console.log(`Updated ${update.old} -> ${updated.name} (matched by name)`);
                updateCount++;
            }
        }
    }

    console.log(`Done! Matched ${matchCount}, Updated ${updateCount}`);
    process.exit(0);
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

run().catch(console.error);
