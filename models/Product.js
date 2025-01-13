const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const productSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    desc: { type: String, required: true, },
    price: { type: Number, required: true, },
    mrp: { type: Number, required: true, },
    category: { type: String, required: true, },
    image: { type: String, required: false },
}, { timestamps: true });


module.exports = mongoose.model('Product', productSchema);
