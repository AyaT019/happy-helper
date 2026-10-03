/**
 * One-shot admin route to rename UUID stickers.
 * Call: POST /api/admin/rename-uuid
 * (Admin only - requires Authorization: Bearer <token>)
 */

import express from 'express';
import { Sticker } from '../models/Sticker.js';
import { requireAdmin } from '../middleware/auth.middleware.js';

export const router = express.Router();

const UUID_MAP = [
    { oldName: '09f31148 e5ef 4e8f 9a84 d095297024fc', name: 'Professional Overthinker', category: 'Aesthetic', categories: ['Aesthetic'], emoji: '🌸' },
    { oldName: '20035a31 90ba 40d1 a89d 308a2b57b03b', name: 'Powerpuff Girl Graduation', category: 'Aesthetic', categories: ['Aesthetic'], emoji: '🌸' },
    { oldName: 'a50658d7 f391 429f 8f24 b2c7b2d40877', name: 'Coffee Element (Periodic Table)', category: 'Aesthetic', categories: ['Aesthetic'], emoji: '☕' },
    { oldName: 'bb9f7d43 2e76 48f0 8cfa c4f1744cfee0', name: 'Pretty Face Dark Soul', category: 'Aesthetic', categories: ['Aesthetic'], emoji: '🌸' },
    { oldName: 'dadd07c9 104c 41e5 ad7f 4273bcce7389', name: 'Black Cat What Knife', category: 'Aesthetic', categories: ['Aesthetic'], emoji: '🐱' },
    { oldName: '04abecc4 5aee 4540 aa07 9e3e6ee26065', name: 'Sharingan Eyes Naruto', category: 'Anime', categories: ['Anime'], emoji: '⛩️' },
    { oldName: '0ea9b94a a913 4851 b03b 5b71554028f7', name: 'Komi San Excited', category: 'Anime', categories: ['Anime'], emoji: '⛩️' },
    { oldName: '1c68a2f2 939d 4235 9b8a 4737084677b3', name: 'Mitsuri Kanroji Chibi', category: 'Anime', categories: ['Anime'], emoji: '⛩️' },
    { oldName: '2f88f884 3aa1 4276 9197 5a2a8107ef3f', name: 'Mikasa Ackerman Portrait', category: 'Anime', categories: ['Anime'], emoji: '⛩️' },
    { oldName: '5a08efb3 d4a4 423a 8573 e99b76f1be83', name: 'One Piece Devil Fruit', category: 'Anime', categories: ['Anime'], emoji: '⛩️' },
    { oldName: '8951c87a ea76 4fc6 9ab4 c5be1d8437dd', name: 'Anime Girl With Glasses Dark', category: 'Anime', categories: ['Anime'], emoji: '⛩️' },
    { oldName: '8a0a8781 0ae5 4b80 bba3 68a482024bf9', name: 'Kakashi Hatake Manga', category: 'Anime', categories: ['Anime'], emoji: '⛩️' },
    { oldName: '8b29f5eb 7252 4999 bec6 8f777005ff3c', name: 'Zenitsu Thunder Eyes', category: 'Anime', categories: ['Anime'], emoji: '⛩️' },
    { oldName: '8f5eef56 01b8 4d20 a2cf f89955c91664', name: 'Usopp and Luffy Daaaamn', category: 'Anime', categories: ['Anime'], emoji: '⛩️' },
    { oldName: 'cd794160 6f7e 478e b0a7 f349af84d2a6', name: 'Jolyne Cujoh Queen of Diamonds', category: 'Anime', categories: ['Anime'], emoji: '⛩️' },
    { oldName: 'ed94632a a346 4c43 986d 59f9ab9a32f3', name: 'Sukuna King of Curses', category: 'Anime', categories: ['Anime'], emoji: '⛩️' },
    { oldName: '020f5d2b 6551 41c9 afb3 c32223cf67ed', name: 'Caution Engineer in Training', category: 'Memes & Uni Chaos', categories: ['Memes & Uni Chaos'], emoji: '😂' },
    { oldName: '0b5f0c0a 06db 4032 86b4 d6506d83c83d', name: 'Think Before You Speak (Arabic)', category: 'Memes & Uni Chaos', categories: ['Memes & Uni Chaos'], emoji: '😂' },
    { oldName: '0d842a3f 7fd3 46bc ab69 ecdd54e552c3', name: 'GTA Wasted', category: 'Memes & Uni Chaos', categories: ['Memes & Uni Chaos'], emoji: '😂' },
    { oldName: '1b7578a0 b4fe 4916 8ff0 1548e6771229', name: 'GTA 6 Stars Wanted', category: 'Memes & Uni Chaos', categories: ['Memes & Uni Chaos'], emoji: '😂' },
    { oldName: '243cf00f 68d1 4b12 81bb 73f3fa33e2ef', name: 'Stop Asking Me I Am Not Google', category: 'Memes & Uni Chaos', categories: ['Memes & Uni Chaos'], emoji: '😂' },
    { oldName: '25f71180 80ab 4290 8f53 43f51a585bb5', name: 'Hold On Let Me ChatGPT This', category: 'Memes & Uni Chaos', categories: ['Memes & Uni Chaos'], emoji: '😂' },
    { oldName: '2a3e8030 8eb1 4d2c ab29 4663ee5150d4', name: 'Everything Is Under Ctrl', category: 'Memes & Uni Chaos', categories: ['Memes & Uni Chaos'], emoji: '😂' },
    { oldName: '3a5b6c6c 672e 42b1 b2b9 a73d55202dc4', name: 'Think Outside the Box', category: 'Memes & Uni Chaos', categories: ['Memes & Uni Chaos'], emoji: '😂' },
    { oldName: '5034ea3a 6d03 4b65 b3d4 3293ff126468', name: 'Sorry I Am Late I Did Not Want to Come', category: 'Memes & Uni Chaos', categories: ['Memes & Uni Chaos'], emoji: '😂' },
    { oldName: '7e03e5ec d695 41f5 b863 3e96f9da64eb', name: 'Error 4:04 Sleep Not Found', category: 'Memes & Uni Chaos', categories: ['Memes & Uni Chaos'], emoji: '😂' },
    { oldName: '846abb50 0317 4eea 869d 5c7e6415545f', name: 'Software Engineer Girl', category: 'Memes & Uni Chaos', categories: ['Memes & Uni Chaos'], emoji: '😂' },
    { oldName: '853f9877 cc15 4e76 8e70 40574fc18369', name: '1+1=10 Computer Science Is Not An Opinion', category: 'Memes & Uni Chaos', categories: ['Memes & Uni Chaos'], emoji: '😂' },
    { oldName: '95674bad 24e5 46d3 9b7f ce58f93bfba9', name: 'Ask ChatGPT Not Me', category: 'Memes & Uni Chaos', categories: ['Memes & Uni Chaos'], emoji: '😂' },
    { oldName: '9a65ee7f 141e 4579 bae3 9ae679e46e41', name: 'Warning No Stupid People Beyond This Point', category: 'Memes & Uni Chaos', categories: ['Memes & Uni Chaos'], emoji: '😂' },
    { oldName: '9b1d0074 1809 4a18 852d 806780683b35', name: 'Cool Python Logo', category: 'Memes & Uni Chaos', categories: ['Memes & Uni Chaos'], emoji: '😂' },
    { oldName: '9c4f3785 7f03 4fb7 a732 acb9280dfecc', name: "I'm Not Angry This Is Just My Face", category: 'Memes & Uni Chaos', categories: ['Memes & Uni Chaos'], emoji: '😂' },
    { oldName: 'c2183525 8075 439c 8300 3c91f887108f', name: 'Why Not?', category: 'Memes & Uni Chaos', categories: ['Memes & Uni Chaos'], emoji: '😂' },
    { oldName: 'c99c1f0a ccf0 4f83 a1d1 2c2eb2db8531', name: "It's a Beautiful Day to Leave Me Alone", category: 'Memes & Uni Chaos', categories: ['Memes & Uni Chaos'], emoji: '😂' },
    { oldName: 'db6c4fae ae7a 4450 94f1 5de8f1ffcfa5', name: "I'll Make Better Mistakes Tomorrow", category: 'Memes & Uni Chaos', categories: ['Memes & Uni Chaos'], emoji: '😂' },
    { oldName: 'e3406ff7 c348 4918 9cb7 4e0932d6d5a3', name: 'I Hate Programming - I Love Programming', category: 'Memes & Uni Chaos', categories: ['Memes & Uni Chaos'], emoji: '😂' },
    { oldName: 'f3f766bf 1556 4161 9379 da6390fef84c', name: 'My Code Works! (I Have No Idea Why)', category: 'Memes & Uni Chaos', categories: ['Memes & Uni Chaos'], emoji: '😂' },
];

router.post('/', requireAdmin, async (req, res, next) => {
    try {
        let updated = 0;
        let notFound = 0;
        const results = [];

        for (const item of UUID_MAP) {
            const result = await Sticker.findOneAndUpdate(
                { name: item.oldName },
                { $set: { name: item.name, category: item.category, categories: item.categories, emoji: item.emoji } },
                { new: true }
            );
            if (result) {
                updated++;
                results.push({ status: 'updated', from: item.oldName, to: item.name });
            } else {
                notFound++;
                results.push({ status: 'not_found', name: item.oldName });
            }
        }

        res.json({ updated, notFound, results });
    } catch (err) {
        next(err);
    }
});
