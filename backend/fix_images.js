const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    const Product = mongoose.model('Product', new mongoose.Schema({ name: String, images: [{url: String}] }));
    const p = await Product.find({});
    console.log('---CHECKING IMAGES---');
    let count = 0;
    for (const prod of p) {
        if (prod.images?.[0]?.url) {
            let url = prod.images[0].url;
            // Force working format: https://images.unsplash.com/...w=600
            if (url.includes('unsplash.com')) {
                let clean = url.replace(/w=\d+/, 'w=600').replace('https:/images', 'https://images');
                if (clean !== url) {
                    prod.images[0].url = clean;
                    await prod.save();
                    count++;
                    console.log(`Updated: ${prod.name}`);
                }
            }
        }
    }
    console.log(`Successfully fixed ${count} product images.`);
    process.exit(0);
}
run();
