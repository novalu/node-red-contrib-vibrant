import {Node, Red} from "node-red";
import Vibrant = require('node-vibrant');
import * as fs from "fs";
import * as mime from "mime-types";
import * as Joi from "@hapi/joi";

async function processPalette(node: Node, msg, send, done, path: string) {
    try {
        const palette = await Vibrant.from(path).getPalette();
        msg.payload = {
            Vibrant: palette.Vibrant,
            DarkMuted: palette.DarkMuted,
            DarkVibrant: palette.DarkVibrant,
            LightMuted: palette.LightMuted,
            LightVibrant: palette.LightVibrant,
            Muted: palette.Muted
        };
        node.status({ });
        send(msg);
        if (done) done();
    } catch (err) {
        node.status({ fill: "red", shape: "ring", text: err.message });
        if (done) done(err);
        else node.error(err, msg);
    }
}

async function processFile(node: Node, msg, send, done, path: string) {
    const exists = fs.existsSync(path);
    if (exists) {
        const stats = fs.statSync(path);
        if (stats.isFile()) {
            const mimeType = mime.lookup(path);
            if (mimeType && mimeType.startsWith("image")) {
                await processPalette(node, msg, send, done, path);
            } else {
                node.status({fill: "red", shape: "ring", text: "File is not an image"});
                if (done) done("File is not an image");
                else node.error("File is not an image", msg);
            }
        } else {
            node.status({fill: "red", shape: "ring", text: "There is no file on given path"});
            if (done) done("There is no file on given path");
            else node.error("There is no file on given path", msg);
        }
    } else {
        node.status({ fill: "red", shape: "ring", text: "Path not exists" });
        if (done) done("Path not exists");
        else node.error("Path not exists", msg);
    }
}

const func = (RED: Red) => {
    const vibrantNode = function (config) {
        const node: Node = this;
        RED.nodes.createNode(node, config);
        node.on("input", async function(msg, send, done) {
            send = send || function() { node.send.apply(node,arguments) }
            const path = msg.payload;
            const uriValidation = Joi.string().uri({ scheme: [ "http", "https" ]}).validate(path);
            if (uriValidation.error) {
                await processFile(node, msg, send, done, path);
            } else {
                await processPalette(node, msg, send, done, path);
            }
        });
    }
    RED.nodes.registerType("vibrant", vibrantNode);
}

module.exports = func;