"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("./error");
const checkRole = (role) => {
    return async (req, res, next) => {
        if (role === "mentor" && req.user.role !== role)
            return next(new error_1.CustomError("Not Authorised", 403));
        if (role === "parent" && req.user.role !== role)
            return next(new error_1.CustomError("Not Authorised", 403));
        if (role === "admin" && req.user.role !== role)
            return next(new error_1.CustomError("Not Authorised", 403));
        next();
    };
};
exports.default = checkRole;
