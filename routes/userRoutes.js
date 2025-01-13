const express = require('express');
const { signup,
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
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

///////////////USER////////////////////////
router.post('/signup', signup);
router.post('/signin', signin);
router.post('/signout', protect, signout);
router.get('/profile', protect, getUserProfile, (req, res) => {
    res.json(req.user);
});
router.get('/all-address', protect, getAllAddress);
router.post('/add-address', protect, addAddress);
router.post('/update-address/:id', protect, updateAddress);
router.post('/delete-address/:id', protect, deleteAddress);


///////////////PRODUCTS////////////////////////
router.get('/all-products', getAllProducts);
router.get('/all-categories', getAllCategories);
router.get('/product/:id', getProductById);


///////////////CART////////////////////////
router.post('/add-to-cart', protect, addToCart);
router.get('/cart', protect, getCart);
router.post('/update-quantiy', protect, updateCartQuantity);
router.post('/remove-item', protect, removeFromCart);

///////////////ORDER////////////////////////
router.get('/checkout', protect, checkout);
router.post('/confirm-order', protect, confirmOrder);




module.exports = router;
