"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.todaysVibeSchema = exports.Mood = void 0;
const zod_1 = require("zod");
var Mood;
(function (Mood) {
    Mood["Sad"] = "sad";
    Mood["Unhappy"] = "unhappy";
    Mood["Neutral"] = "neutral";
    Mood["Smiling"] = "smiling";
    Mood["Laughing"] = "laughing";
})(Mood || (exports.Mood = Mood = {}));
exports.todaysVibeSchema = zod_1.z.object({
    todaysVibe: zod_1.z.nativeEnum(Mood),
});
