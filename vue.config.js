module.exports = {
    lintOnSave: false,
    outputDir: 'back-end/public',
    devServer: {
        proxy: {
            '/api': {
                target: `http://${process.env.CC_HOST}:${process.env.CC_PORT}`,
                ws: true,
                changeOrigin: false
            }
        }
    }
};
