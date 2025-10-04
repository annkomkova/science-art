const HtmlWebpackPlugin = require('html-webpack-plugin')

function createPage(template, filename) {
  return new HtmlWebpackPlugin({
    template: template,
    filename: filename
  })
}

const htmlPages = [
  createPage('./src/index.html', './index.html'),
  createPage('./src/pages/L-SH-2025.html', './pages/L-SH-2025.html'),
  createPage('./src/pages/L-SH-2024.html', './pages/L-SH-2024.html')
]

module.exports = htmlPages
