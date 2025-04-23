const Product = require("../model/product");
const User = require("../model/user");

// возвращает список товаров в админ меню
function getProducts(req, res, next) {
    //   Product.findAll()
    Product.fetchAll()
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
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    const userId = req.user._id;
    const product = new Product(title, imageUrl, price, description, userId);
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
    Product.update(productId, {
        title: updateTitle,
        imageUrl: updateImageUrl,
        price: updatePrice,
        description: updateDescription,
    })
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
    Product.delete(productId)
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
