function getStatusError404(req, res, next) {
    res.status(404).render("404", { docTitle: "Page Not Found", patch: "/404", isAuthenticated: req.session.isLoggedIn });
}
function getStatusError500(req, res, next) {
    res.status(500).render("500", { docTitle: "Error", patch: "/500", isAuthenticated: req.session.isLoggedIn });
}

module.exports = {
    getStatusError404,
    getStatusError500,
};
