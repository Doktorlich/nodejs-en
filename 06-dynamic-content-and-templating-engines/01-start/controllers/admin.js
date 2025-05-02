const Product = require("../model/product");
const User = require("../model/user");
const { validationResult } = require("express-validator");
const fileHelper = require("../util/file");
// возвращает список товаров в админ меню
function getProducts(req, res, next) {
    //
    Product.find({ userId: req.user._id })
        .then(products => {
            res.render("admin/products", {
                cbProducts: products,
                docTitle: "Admin Products",
                path: "/admin/products",
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}
// создает новый товар
function getAddProduct(req, res, next) {
    res.render("admin/edit-product", {
        docTitle: "Add Product",
        path: "/admin/add-product",
        errorMessage: null,
        oldInput: { tittle: "", imageUrl: "", prise: "", description: "" },
        validationErrors: [],
        csrfToken: req.csrfToken(),
        editing: false,
    });
}
// отправляет новый товар в БД
function postAddProduct(req, res, next) {
    const titleBody = req.body.title;
    const image = req.file;
    const priceBody = req.body.price;
    const descriptionBody = req.body.description;
    const userIdBody = req.user._id;
    const errors = validationResult(req);
    if (!image) {
        return res.status(422).render("admin/edit-product", {
            docTitle: "Add Product",
            path: "/admin/add-product",
            errorMessage: errors.array()[0].msg,
            validationErrors: [],
            csrfToken: req.csrfToken(),
        });
    }
    const imageUrl = req.file.path.replace(/\\/g, "/");
    const product = new Product({
        title: titleBody,
        imageUrl: imageUrl,
        price: priceBody,
        description: descriptionBody,
        userId: userIdBody,
    });

    if (!errors.isEmpty()) {
        return res.status(422).render("admin/edit-product", {
            docTitle: "Add Product",
            path: "/admin/add-product",
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array(),
            oldInput: { title: titleBody, image: imageUrl, price: priceBody, description: descriptionBody },
            csrfToken: req.csrfToken(),
        });
    }

    product
        .save()
        .then(result => {
            console.log("Created product");
            res.redirect("/admin/products");
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
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
                errorMessage: null,
                oldInput: { tittle: "", imageUrl: "", prise: "", description: "" },
                validationErrors: [],
                csrfToken: req.csrfToken(),
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}
// оптравка запроса на применение изменений из формы
function postEditProduct(req, res, next) {
    const productId = req.body.productId;
    const updateTitle = req.body.title;

    const updateImageUrl = req.body.imageUrl;
    const image = req.file;

    const updatePrice = req.body.price;
    const updateDescription = req.body.description;
    const newImageUrl = image ? image.path.replace(/\\/g, "/") : updateImageUrl;
    const errors = validationResult(req);

    Product.findById(productId)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect("/");
            } else {
                if (!errors.isEmpty()) {
                    return res.status(422).render(`admin/edit-product`, {
                        docTitle: "Add Product",
                        path: "/admin/edit-product",
                        errorMessage: errors.array()[0].msg,
                        validationErrors: errors.array(),
                        oldInput: {
                            productId: productId,
                            title: updateTitle,
                            imageUrl: updateImageUrl,
                            price: updatePrice,
                            description: updateDescription,
                        },
                        csrfToken: req.csrfToken(),
                        editing: true,
                    });
                }
                if (image) {
                    fileHelper.deleteFile(product.imageUrl);
                    product.imageUrl = image.path;
                }
                Product.updateOne(
                    { _id: productId },
                    {
                        $set: {
                            title: updateTitle,
                            imageUrl: newImageUrl, // ✅ корректное значение
                            price: updatePrice,
                            description: updateDescription,
                        },
                    },
                )
                    .then(product => {
                        res.redirect("/admin/products");
                    })
                    .catch(err => {
                        const error = new Error(err);
                        error.httpStatusCode = 500;
                        return next(error);
                    });
            }
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}
// отправка запроса на удаление карточки с продуктами
function postDeleteProduct(req, res, next) {
    const productId = req.body.productId;

    Product.findById(productId)
        .then(product => {
            if (!product) {
                return next(new Error("Product not found"));
            }
            fileHelper.deleteFile(product.imageUrl);
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect("/");
            } else {
                Product.deleteOne({ _id: productId })
                    .then(() => {
                        res.redirect("/admin/products");
                    })
                    .catch(err => {
                        const error = new Error(err);
                        error.httpStatusCode = 500;
                        return next(error);
                    });
            }
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
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
