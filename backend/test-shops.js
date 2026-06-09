require('dotenv').config();
const mongoose = require('mongoose');
const Shop = require('./models/Shop');

async function checkShops() {
    await mongoose.connect(process.env.MONGODB_URI);
    const shops = await Shop.find({});
    console.log("Total shops in DB:", shops.length);
    for (let s of shops) {
        console.log(`- Shop: ${s.name}, isActive: ${s.isActive}, Owner: ${s.owner}, ID: ${s._id}`);
        console.log(`  Products count: ${s.products ? s.products.length : 0}`);
    }
    process.exit(0);
}
checkShops();
