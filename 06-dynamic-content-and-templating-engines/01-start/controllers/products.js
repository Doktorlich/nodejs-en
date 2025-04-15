function getAddProduct(req, res, next) {
    // res.sendFile(path.join(rootDir, "views", "add-product.html"));
    res.render("add-product.ejs", { docTitle: "Add Product", path: "/admin/add-product" });
}
const products = [];
function postAddProduct(req, res, next) {
    products.push({ title: req.body.title });
    res.redirect("/");
}

module.exports = { getAddProduct, postAddProduct, products };
