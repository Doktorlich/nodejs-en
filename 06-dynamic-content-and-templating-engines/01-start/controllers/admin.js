const Product = require("../model/product");

function getAddProduct(req, res, next) {
    res.render("admin/edit-product", {
        docTitle: "Add Product",
        path: "/admin/add-product",
        editing: false,
    });
}

function postAddProduct(req, res, next) {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    const product = new Product(null, title, imageUrl, price, description);
    product
        .save()
        .then(() => {
            res.redirect("/");
        })
        .catch(error => {
            console.error("postAddProduct error", error);
        });
}

function getEditProduct(req, res, next) {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect("/");
    }
    const productId = req.params.productId;
    Product.findById(productId, product => {
        if (!product) {
            return res.redirect("/");
        }
        res.render("admin/edit-product", {
            docTitle: "Edit Product",
            path: "/admin/edit-product",
            editing: editMode,
            product: product,
        });
    });
}
function postEditProduct(req, res, next) {
    try {
        const productId = req.body.productId;
        const updateTitle = req.body.title;
        const updateImageUrl = req.body.imageUrl;
        const updatePrice = req.body.price;
        const updateDescription = req.body.description;
        const updateProduct = new Product(productId, updateTitle, updateImageUrl, updatePrice, updateDescription);
        updateProduct.save();
        res.redirect("/admin/products");
    } catch (error) {
        console.error("Error", error);
    }
}

function getProducts(req, res, next) {
    Product.fetchAll(cbProducts => {
        res.render("admin/products", {
            cbProducts,
            docTitle: "Admin Products",
            path: "/admin/products",
        });
    });
}

function postDeleteProduct(req, res, next) {
    const productId = req.body.productId;
    Product.deleteById(productId);
    res.redirect("/admin/products");
}

module.exports = { getAddProduct, postAddProduct, getProducts, getEditProduct, postEditProduct, postDeleteProduct };
