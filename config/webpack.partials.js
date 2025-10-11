const HtmlWebpackPartialsPlugin = require('html-webpack-partials-plugin')
const path = require('path')

function createPartialPlugin(partialPath, location) {
  return new HtmlWebpackPartialsPlugin([
    {
      path: path.join(__dirname, partialPath),
      location: location,
      template_filename: '*',
      priority: 'replace'
    }
  ])
}

const htmlWebpackPartialsPlugins = [
  createPartialPlugin('../src/partials/footer.html', 'footer')
]

module.exports = htmlWebpackPartialsPlugins
