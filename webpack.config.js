const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: {
        "popup": "./src/popup.js",
        "background": "./src/background.js",
        "content-script": "./src/content-script.js",
        "settings": "./src/settings.js"
    },
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "dist")
    },
    mode: "production",
    //devtool: false,
    plugins: [
        new CopyWebpackPlugin({
            patterns: [{from: "static"}]
        })
    ]
}