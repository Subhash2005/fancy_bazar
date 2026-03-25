const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    const Product = mongoose.model('Product', new mongoose.Schema({ name: String, images: [{url: String}] }));
    const titles = ['Designer Sunglasses', 'Scented Candle Set', 'Luxury Rose Gold Watch', 'Silk Scarf Blue'];
    const products = await Product.find({ name: { $in: titles } });
    console.log('---START---');
    products.forEach(p => console.log(`${p.name}|${p._id}|${p.images?.[0]?.url}`));
    console.log('---END---');
    process.exit(0);
}
run();
