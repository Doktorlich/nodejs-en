const deleteButtons = document.querySelectorAll(".delete-btn");

deleteButtons.forEach(button => {
    button.addEventListener("click", function () {
        const productId = button.parentNode.querySelector("[name=productId]").value;
        const csrf = button.parentNode.querySelector("[name=_csrf]").value;
        const productElement = button.closest("article");

        fetch("/admin/product/" + productId, {
            method: "DELETE",
            headers: {
                "csrf-token": csrf,
            },
        })
            .then(result => result.json())
            .then(data => {
                console.log(data);
                productElement.parentNode.removeChild(productElement);
            })
            .catch(err => console.error(err));
    });
});

// const deleteItem = btn => {
//     const productId = btn.parentNode.querySelector("[name=productId]").value;
//     const csrf = btn.parentNode.querySelector("[name=_csrf]").value;
//     const productElement = btn.closest("article");
//     fetch("/admin/product/" + productId, { method: "DELETE", headers: { "csrf-token": csrf } })
//         .then(result => {
//             return console.log(result);
//         })
//         .then(data => {
//             console.log(data);
//             productElement.parentNode.removeChild(productElement);
//         })
//         .catch(error => {
//             console.error(error);
//         });
// };
