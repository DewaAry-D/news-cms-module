const { body, validationResult } = require('express-validator');

export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }

    return res.status(400).json({
        status: 'error',
        errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
        }))
    });
};