const Product = require("../model/product");
const User = require("../model/user");

// возвращает список товаров в админ меню
function getProducts(req, res, next) {
    Product.find()
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
// создает новый товар
function getAddProduct(req, res, next) {
    res.render("admin/edit-product", {
        docTitle: "Add Product",
        path: "/admin/add-product",
        editing: false,
    });
}
// отправляет новый товар в БД
function postAddProduct(req, res, next) {
    const titleBody = req.body.title;
    const imageUrlBody = req.body.imageUrl;
    const priceBody = req.body.price;
    const descriptionBody = req.body.description;
    const userIdBody = req.user._id;
    const product = new Product({
        title: titleBody,
        imageUrl: imageUrlBody,
        price: priceBody,
        description: descriptionBody,
        userId: userIdBody,
    });
    product
        .save()
        .then(result => {
            console.log("Created product");
            res.redirect("/admin/products");
        })
        .catch(error => {
            console.error(error);
        });
}
// по нажатию активирует карточку редактирование товара
function getEditProduct(req, res, next) {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect("/");
    }
    const productId = req.params.productId;
    Product.findById(productId)
        .then(product => {
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
// оптравка запроса на применение изменений из формы
function postEditProduct(req, res, next) {
    const productId = req.body.productId;
    const updateTitle = req.body.title;
    const updateImageUrl = req.body.imageUrl;
    const updatePrice = req.body.price;
    const updateDescription = req.body.description;
    Product.updateOne(
        { _id: productId },
        { $set: { title: updateTitle, imageUrl: updateImageUrl, price: updatePrice, description: updateDescription } },
    )
        .then(() => {
            res.redirect("/admin/products");
        })
        .catch(error => {
            console.error(error);
        });
}
// отправка запроса на удаление карточки с продуктами
function postDeleteProduct(req, res, next) {
    const productId = req.body.productId;
    Product.deleteOne({ _id: productId })
        .then(() => {
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
