const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Address = require('../models/Address');

const { generateToken } = require('../utils/token');

// User Signup
const signup = async (req, res) => {
    const { name, email, phone, password } = req.body;
    try {
        if (await User.findOne({ email })) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const user = await User.create({ name, email, phone, password });
        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// User Signin
const signin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            res.status(200).json({
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// User Signout
const signout = (req, res) => {
    res.status(200).json({ message: 'Signed out successfully' });
};

const getUserProfile = async (req, res) => {
    try {
        // Populate the addresses field with the full address data
        const user = await User.findById(req.user._id).populate('addresses');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send the full user details along with the populated addresses
        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            addresses: user.addresses,  // This will now contain the full address details
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

const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const addToCart = async (req, res) => {
    const { productId, quantity } = req.body;

    // Debugging logs to inspect req.user
    console.log('Request user:', req.user);

    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized. User not found.' });
    }

    const userId = req.user._id;

    try {
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            cart.items.push({ product: productId, quantity });
        }

        await cart.save();

        res.status(200).json({ message: 'Product added to cart', cart });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const getCart = async (req, res) => {
    const userId = req.user._id;

    try {
        const cart = await Cart.findOne({ user: userId }).populate('items.product', 'title price image');

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        res.status(200).json(cart);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const removeFromCart = async (req, res) => {
    const { productId } = req.body;
    const userId = req.user._id;

    try {
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item.product.toString() !== productId);

        await cart.save();

        res.status(200).json({ message: 'Product removed from cart', cart });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateCartQuantity = async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    try {
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
            await cart.save();
            res.status(200).json({ message: 'Cart updated', cart });
        } else {
            res.status(404).json({ message: 'Product not found in cart' });
        }
    } catch (error) {
        console.error('Error updating cart quantity:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Controller for checkout
const checkout = async (req, res) => {
    const userId = req.user._id;

    try {
        // Fetch the user's cart with product details
        const cart = await Cart.findOne({ user: userId }).populate('items.product', 'title price image');

        if (!cart || cart.items.length === 0) {
            return res.status(404).json({ message: 'Your cart is empty' });
        }

        // Calculate the total price
        const totalPrice = cart.items.reduce((total, item) => {
            return total + item.product.price * item.quantity;
        }, 0);

        res.status(200).json({
            cart: cart.items,
            totalPrice,
        });
    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Controller for confirming the order
const confirmOrder = async (req, res) => {
    const userId = req.user._id;

    try {
        // Fetch the user's cart
        const cart = await Cart.findOne({ user: userId }).populate('items.product', 'title price');

        if (!cart || cart.items.length === 0) {
            return res.status(404).json({ message: 'Your cart is empty' });
        }

        // Calculate the total price
        const totalPrice = cart.items.reduce((total, item) => {
            return total + item.product.price * item.quantity;
        }, 0);


        // Create an order
        const order = new Order({
            user: userId,
            items: cart.items,
            totalAmount: totalPrice,
            paymentMethod: 'Cash on Delivery',
            status: 'Pending',
        });

        await order.save();

        // Clear the cart after successful order creation
        cart.items = [];
        await cart.save();

        res.status(200).json({
            message: 'Order placed successfully',
            order,
        });
    } catch (error) {
        console.error('Error confirming order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const addAddress = async (req, res) => {
    const { street, city, state, postalCode } = req.body;

    try {
        // Create a new address
        const newAddress = new Address({
            street,
            city,
            state,
            postalCode,
            userId: req.user._id,
        });

        // Save the address to the Address collection
        const savedAddress = await newAddress.save();

        // Find the user and add the address ID to the addresses array
        const user = await User.findById(req.user._id);
        user.addresses.push(savedAddress._id);
        await user.save();

        // Populate the address after saving
        const populatedAddress = await Address.findById(savedAddress._id).populate('userId');

        res.status(201).json({
            message: 'Address added successfully!',
            address: populatedAddress, // Send the full populated address
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getAllAddress = async (req, res) => {
    const userId = req.user._id;

    try {
        const addresses = await Address.find({ userId });
        res.status(200).json(addresses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching addresses', error });
    }
}


const updateAddress = async (req, res) => {
    const { id } = req.params;
    const { street, city, state, postalCode, country } = req.body;

    try {
        const updatedAddress = await Address.findByIdAndUpdate(id, {
            street,
            city,
            state,
            postalCode,
            country
        }, { new: true });

        if (!updatedAddress) {
            return res.status(404).json({ message: 'Address not found' });
        }

        res.status(200).json({ message: 'Address updated successfully!', address: updatedAddress });
    } catch (error) {
        res.status(500).json({ message: 'Error updating address', error });
    }
}

const deleteAddress = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedAddress = await Address.findByIdAndDelete(id);

        if (!deletedAddress) {
            return res.status(404).json({ message: 'Address not found' });
        }

        res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting address', error });
    }
}

const aiImage = async (req, res) => {
    const { name } = req.body;

    if (!name) return res.status(400).json({ message: 'Product name is required' });

    try {
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(name)}`;

        // Save product to the database
        const product = new Product({ name, image: imageUrl });
        await product.save();

        res.json({ message: 'Product saved!', product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating image', error });
    }
}



module.exports = {
    signup,
    signin,
    signout,
    getAllProducts,
    getAllCategories,
    getProductById,
    addToCart,
    getCart,
    removeFromCart,
    updateCartQuantity,
    checkout,
    confirmOrder,
    addAddress,
    getAllAddress,
    updateAddress,
    deleteAddress,
    getUserProfile,
    aiImage,
};
