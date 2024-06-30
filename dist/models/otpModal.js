"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const crypto_1 = __importDefault(require("crypto"));
const util_1 = require("util");
const pbkdf2Async = (0, util_1.promisify)(crypto_1.default.pbkdf2);
const OTPSchema = new mongoose_1.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  newUser: {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
    },
  },
});
// Pre-save hook for password hashing
OTPSchema.pre("save", async function (next) {
  if (!this.isModified("newUser.password")) return next();
  try {
    const salt = crypto_1.default.randomBytes(16).toString("hex");
    this.newUser.salt = salt;
    const derivedKey = await pbkdf2Async(
      this.newUser.password,
      salt,
      1000,
      64,
      "sha512",
    );
    this.newUser.password = derivedKey.toString("hex");
    next();
  } catch (err) {
    next(err);
  }
});
const OTPModel = mongoose_1.default.model("OTP", OTPSchema);
exports.default = OTPModel;
