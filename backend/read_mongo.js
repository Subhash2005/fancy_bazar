const mongoose = require('mongoose');
require('dotenv').config();
const fs = require('fs');

const Product = require('./models/Product');
const Category = require('./models/Category');

async function run() {
    let output = '';
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        output += 'Connected to MongoDB\n';

        const products = await Product.find().populate('category');
        output += `Found ${products.length} products:\n`;
        
        products.forEach(p => {
            output += `- ${p.name} (${p.category?.name || 'No Category'})\n`;
            if (p.images && p.images.length > 0) {
                p.images.forEach((img, i) => output += `  Img ${i}: ${img.url}\n`);
            } else {
                output += '  No images\n';
            }
        });

    } catch (err) {
        output += `Error: ${err}\n`;
    } finally {
        fs.writeFileSync('mongo_output.txt', output);
        await mongoose.disconnect();
    }
}

run();
