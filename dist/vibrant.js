"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Vibrant = require("node-vibrant");
const fs = require("fs");
const mime = require("mime-types");
const Joi = require("@hapi/joi");
function processPalette(node, msg, send, done, path) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const palette = yield Vibrant.from(path).getPalette();
            msg.payload = {
                Vibrant: palette.Vibrant,
                DarkMuted: palette.DarkMuted,
                DarkVibrant: palette.DarkVibrant,
                LightMuted: palette.LightMuted,
                LightVibrant: palette.LightVibrant,
                Muted: palette.Muted
            };
            node.status({});
            send(msg);
            if (done)
                done();
        }
        catch (err) {
            node.status({ fill: "red", shape: "ring", text: err.message });
            if (done)
                done(err);
            else
                node.error(err, msg);
        }
    });
}
function processFile(node, msg, send, done, path) {
    return __awaiter(this, void 0, void 0, function* () {
        const exists = fs.existsSync(path);
        if (exists) {
            const stats = fs.statSync(path);
            if (stats.isFile()) {
                const mimeType = mime.lookup(path);
                if (mimeType && mimeType.startsWith("image")) {
                    yield processPalette(node, msg, send, done, path);
                }
                else {
                    node.status({ fill: "red", shape: "ring", text: "File is not an image" });
                    if (done)
                        done("File is not an image");
                    else
                        node.error("File is not an image", msg);
                }
            }
            else {
                node.status({ fill: "red", shape: "ring", text: "There is no file on given path" });
                if (done)
                    done("There is no file on given path");
                else
                    node.error("There is no file on given path", msg);
            }
        }
        else {
            node.status({ fill: "red", shape: "ring", text: "Path not exists" });
            if (done)
                done("Path not exists");
            else
                node.error("Path not exists", msg);
        }
    });
}
const func = (RED) => {
    const vibrantNode = function (config) {
        const node = this;
        RED.nodes.createNode(node, config);
        node.on("input", function (msg, send, done) {
            return __awaiter(this, void 0, void 0, function* () {
                send = send || function () { node.send.apply(node, arguments); };
                const path = msg.payload;
                const uriValidation = Joi.string().uri({ scheme: ["http", "https"] }).validate(path);
                if (uriValidation.error) {
                    yield processFile(node, msg, send, done, path);
                }
                else {
                    yield processPalette(node, msg, send, done, path);
                }
            });
        });
    };
    RED.nodes.registerType("vibrant", vibrantNode);
};
module.exports = func;
//# sourceMappingURL=vibrant.js.map