const mongoose = require('mongoose');
require('dotenv').config();
const fs = require('fs');

const Category = require('./models/Category');

async function run() {
    let output = '';
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const cats = await Category.find();
        output += `Found ${cats.length} categories:\n`;
        cats.forEach(c => {
            output += `- ${c.name} (slug: ${c.slug})\n`;
        });

    } catch (err) {
        output += `Error: ${err}\n`;
    } finally {
        fs.writeFileSync('categories_check.txt', output);
        await mongoose.disconnect();
    }
}

run();
