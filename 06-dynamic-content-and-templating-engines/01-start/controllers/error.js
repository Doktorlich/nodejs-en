function getStatusError404(req, res, next) {
    res.status(404).render("404", { docTitle: "Page Not Found", patch: "/404", isAuthenticated: req.session.isLoggedIn });

    // res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
}

module.exports = {
    getStatusError404,
};
