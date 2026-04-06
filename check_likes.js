import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Like from './src/models/Like.js';

dotenv.config();

const checkLikes = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const likes = await Like.find();
        console.log('Total Likes found:', likes.length);
        
        const breakdown = likes.reduce((acc, curr) => {
            const key = `${curr.targetId}-${curr.targetType}`;
            if (!acc[key]) acc[key] = { id: curr.targetId, type: curr.targetType, reactions: [] };
            acc[key].reactions.push(curr.reactionType);
            return acc;
        }, {});

        console.log('Breakdown by target:');
        console.log(JSON.stringify(breakdown, null, 2));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkLikes();
