const webpackConfig = require('@nextcloud/webpack-vue-config')
const path = require('path')

// Override entry point
webpackConfig.entry = {
    readme: path.join(__dirname, 'src', 'extension.js'),
}

module.exports = webpackConfig
