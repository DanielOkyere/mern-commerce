const Cart = require("../models/cart");

function runUpdate(condition, updateData) {
    return new Promise((resolve, reject) => {
        Cart.fineOneAndUpdate(condition, updateData, { upsert: true })
            .then((result) => resolve())
            .catch((err) => reject(err));
    });
}

exports.addItemToCart = (req, res) => {
    Cart.findOne({ user: req.user._id }).exec((error, cart) => {
        if (error) return res.status(400).json({ error });
        if (cart) {
            let promiseArray = [];
            req.body.cartItems.forEach((cartItem) => {
                const product = cartItem.product;
                const item = cart.cartItems.find((c) => c.product == product);
                let condition, update;
                if (item) {
                    condition = { user: req.user._id, "cartItems.product": product };
                    update = {
                        $set: {
                            "cartItems.$": cartItem,
                        },

                    };
                } else {
                    condition = { user: req.user._id };
                    update = {
                        $push: {
                            cartItems: cartItem,
                        },
                    };
                }
                promiseArray.push(runUpdate(condition, update));

            });
            Promise.all(promiseArray)
                .then((response) => res.status(201).json({ response }))
                .catch((error) => res.status(400).json({ error }));
        } else {
            const cart = new Cart({
                user: req.user._id,
                cartItems: req.body.cartItems,
            });
            cart.save((error, cart) => {
                if (error) return res.status(400).json({ error });
                if (cart) {
                    return res.status(201).json({ cart });
                }
            });
        }
    });
};
      

      
    
  

