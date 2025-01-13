const Admin = require('../models/Admin');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const Order = require('../models/Order');
const multer = require('multer');
const path = require('path');

const { generateToken } = require('../utils/token');

// Admin Signup
const signup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (await Admin.findOne({ email })) {
            return res.status(400).json({ message: 'Admin already exists' });
        }
        const admin = await Admin.create({ name, email, password });
        res.status(201).json({
            id: admin._id,
            name: admin.name,
            email: admin.email,
            token: generateToken(admin._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin Signin
const signin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await Admin.findOne({ email });
        if (admin && (await admin.matchPassword(password))) {
            res.status(200).json({
                id: admin._id,
                name: admin.name,
                email: admin.email,
                token: generateToken(admin._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin Signout
const signout = (req, res) => {
    res.status(200).json({ message: 'Signed out successfully' });
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find(); // Get all users from the database
        res.status(200).json(users); // Return the list of users in the response
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Admin Add Product
// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory to save images
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename with original extension
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Images only!'));
        }
    },
});

// Add product API with image uploader
const addProduct = async (req, res) => {
    const { title, desc, price, mrp, category } = req.body;
    try {
        if (await Product.findOne({ title })) {
            return res.status(400).json({ message: 'Product already exists' });
        }

        const product = await Product.create({
            title,
            desc,
            price,
            mrp,
            category,
            image: req.file ? `/uploads/${req.file.filename}` : null,
        });

        res.status(201).json({
            id: product._id,
            title: product.title,
            desc: product.desc,
            price: product.price,
            mrp: product.mrp,
            category: product.category,
            image: product.image,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find(); // Get all products from the database
        res.status(200).json(products); // Return the list of products in the response
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteProduct = async (req, res) => {
    const { id } = req.params; // Get product ID from the route parameters
    try {
        const product = await Product.findByIdAndDelete(id); // Find and delete the product
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

//CATEGORY
const addCategory = async (req, res) => {
    const { title, desc } = req.body;
    try {
        if (await Category.findOne({ title })) {
            return res.status(400).json({ message: 'Category already exists' });
        }


        const category = await Category.create({
            title,
            desc,
        });
        res.status(201).json({
            id: category._id,
            title: category.title,
            desc: category.desc,

        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find(); // Get all categories from the database
        res.status(200).json(categories); // Return the list of categories in the response
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const deleteCategory = async (req, res) => {
    const { id } = req.params; // Get category ID from the route parameters
    try {
        const category = await Category.findByIdAndDelete(id); // Find and delete the category
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email') // Adjust fields as needed
            .populate('items.product', 'title price image mrp category desc'); // Adjust fields as needed

        res.status(200).json(orders);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const aiImage = async (req, res) => {
    const { name } = req.body;

    if (!name) return res.status(400).json({ message: 'Product name is required' });

    try {
        // Generate the image URL
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(name)}`;

        // Send the image URL in the response
        res.json({ message: 'Image generated successfully!', imageUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating image', error });
    }
};




module.exports = {
    signup,
    signin,
    signout,
    getAllUsers,
    addProduct,
    upload,
    getAllProducts,
    deleteProduct,
    addCategory,
    getAllCategories,
    deleteCategory,
    getAllOrders,
    aiImage,
};
