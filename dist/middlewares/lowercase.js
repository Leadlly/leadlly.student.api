"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const convertToLowercase = (req, res, next) => {
    const convertToLowerCase = (obj) => {
        for (let key in obj) {
            if (typeof obj[key] === "string") {
                obj[key] = obj[key].trim().toLowerCase();
            }
            else if (typeof obj[key] === "object" && obj[key] !== null) {
                convertToLowerCase(obj[key]);
            }
        }
    };
    if (req.body) {
        convertToLowerCase(req.body);
    }
    if (req.query) {
        convertToLowerCase(req.query);
    }
    next();
};
exports.default = convertToLowercase;
