module.exports = {
    entry: './src/client/webpack.js',
    output: {
        filename: 'dist/public/bundle.js'
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    }
};
