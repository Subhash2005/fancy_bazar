const mongoose = require('mongoose');
require('dotenv').config();
const fs = require('fs');

const Product = require('./models/Product');

async function run() {
    let output = '';
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const trendingCount = await Product.countDocuments({ isTrending: true });
        output += `Trending products count: ${trendingCount}\n`;
        
        const allProducts = await Product.find({}, 'name isTrending');
        allProducts.forEach(p => {
            output += `${p.name}: Trending=${p.isTrending}\n`;
        });

    } catch (err) {
        output += `Error: ${err}\n`;
    } finally {
        fs.writeFileSync('trending_check.txt', output);
        await mongoose.disconnect();
    }
}

run();
