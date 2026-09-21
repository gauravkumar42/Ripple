function notFound(req, res) {
    res.status(404).json({ error: "Not found" });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    console.error(err);

    if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "That value is already taken" });
    }

    const status = err.status || 500;
    res.status(status).json({
        error: status === 500 ? "Something went wrong on our end" : err.message,
    });
}

module.exports = { notFound, errorHandler };
