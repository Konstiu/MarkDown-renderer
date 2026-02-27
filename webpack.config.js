const webpackConfig = require('@nextcloud/webpack-vue-config')
const path = require('path')

// Override entry point
webpackConfig.entry = {
    readme: path.join(__dirname, 'src', 'extension.js'),
}

// Add CSS handling
webpackConfig.module.rules.push({
    test: /\.css$/,
    use: ['style-loader', 'css-loader'],
})

module.exports = webpackConfig
