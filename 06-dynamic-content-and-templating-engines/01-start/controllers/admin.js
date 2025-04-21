const Product = require("../model/product");
const User = require("../model/user");

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
    console.log("instanceof", req.user instanceof User);
    req.user
        .createProduct({ title, imageUrl, price, description })
        .then(result => {
            res.redirect("/");
        })
        .catch(error => {
            console.error(error);
        });
}

//     Product.create({ title, imageUrl, price, description })
//         .then(result => {
//             res.redirect("/");
//         })
//         .catch(error => {
//             console.error(error);
//         });

function getEditProduct(req, res, next) {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect("/");
    }

    const productId = req.params.productId;
    // Product.findAll({ where: { id: productId } })
    req.user
        .getProducts({ where: { id: productId } })
        .then(([product]) => {
            res.render("admin/edit-product", {
                docTitle: "Edit Product",
                path: "/admin/edit-product",
                editing: editMode,
                product: product,
            });
        })
        .catch(error => {
            console.error(error);
        });
}
function postEditProduct(req, res, next) {
    const productId = parseInt(req.body.productId);
    const updateTitle = req.body.title;
    const updateImageUrl = req.body.imageUrl;
    const updatePrice = parseFloat(req.body.price);
    const updateDescription = req.body.description;
    Product.update(
        {
            title: updateTitle,
            imageUrl: updateImageUrl,
            price: updatePrice,
            description: updateDescription,
        },
        { where: { id: productId } },
    )
        .then(() => {
            res.redirect("/admin/products");
        })
        .catch(error => {
            console.error(error);
        });
}

function getProducts(req, res, next) {
    //   Product.findAll()
    req.user
        .getProducts()
        .then(products => {
            res.render("admin/products", {
                cbProducts: products,
                docTitle: "Admin Products",
                path: "/admin/products",
            });
        })
        .catch(error => {
            console.error(error);
        });
}

function postDeleteProduct(req, res, next) {
    const productId = req.body.productId;
    Product.destroy({ where: { id: productId } })
        .then(product => {
            res.redirect("/admin/products");
        })
        .catch(error => {
            console.error(error);
        });
}

module.exports = {
    getAddProduct,
    postAddProduct,
    getProducts,
    getEditProduct,
    postEditProduct,
    postDeleteProduct,
};
