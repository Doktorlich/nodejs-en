const deleteItem = btn => {
    const productId = btn.parentNode.querySelector("[name=productId]").value;
    const csrf = btn.parentNode.querySelector("[name=_csrf]").value;
    const productElement = btn.closest("article");
    fetch("/admin/product/" + productId, { method: "DELETE", headers: { "csrf-token": csrf } })
        .then(result => {
            return console.log(result);
        })
        .then(data => {
            console.log(data);
            productElement.parentNode.removeChild(productElement);
        })
        .catch(error => {
            console.error(error);
        });
};
