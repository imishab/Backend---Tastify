const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const categorySchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true },
    desc: { type: String, required: false, },
}, { timestamps: true });


module.exports = mongoose.model('Category', categorySchema);
