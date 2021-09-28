const WebpackMerge = require("webpack-merge");
const webpack = require('webpack');
const baseWebpackConfig = require("./webpack.base.config")
const utils = require("./utils")
const HtmlWebpackPlugin = require("html-webpack-plugin")

const { getModuleList , getBuildEntry} = require("./module-entry")

// 获取各个模块
const moduleList = getModuleList();
console.log(moduleList)

const HtmlWebpackPluginList = [];
for(let index in moduleList){
    const moduleName = moduleList[index]
    HtmlWebpackPluginList.push(new HtmlWebpackPlugin({
        filename: utils.resolve('./../dist/'+ moduleName+ '/index.html'), // html模板的生成路径
        template: utils.resolve("./../src/modules/" + moduleName + "/index.html"),//html模板
        inject: true, // true：默认值，script标签位于html文件的 body 底部
        chunks: [moduleName],  // 注入哪个名称bundel
    }))
}


module.exports = WebpackMerge.merge(baseWebpackConfig,{
    entry: getBuildEntry(),
    // 指定构建环境  
    mode:"development",
    // 插件
    plugins:[
        new webpack.ProvidePlugin({
            Buffer: ['buffer', 'Buffer']
          }),
        new HtmlWebpackPlugin({
            filename: utils.resolve('./../dist/index.html'), // html模板的生成路径
            template: 'index.html',//html模板
            chunks: ['app'],
            inject: true, // true：默认值，script标签位于html文件的 body 底部
        })
    ].concat(HtmlWebpackPluginList),
    // 开发环境本地启动的服务配置
    devServer: {
        historyApiFallback: false, // 当找不到路径的时候，默认加载index.html文件
        hot: true,
        static: false, // 告诉服务器从哪里提供内容。只有在你想要提供静态文件时才需要
        compress: false, // 一切服务都启用gzip 压缩：
        port: "8081", // 指定段靠谱
        devMiddleware: {
            publicPath: "/", // 访问资源加前缀
        },
        proxy: {
            // 接口请求代理
        },
    }
});