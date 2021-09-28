const glob = require("glob")

// 获取各个模块名称
function getModuleList(){
    const moduleList = glob.sync("./src/modules/*");
    for(let index = 0 ; index < moduleList.length ; index++){
        const item = moduleList[index];
        const tmpList = item.split("/");
        moduleList[index] = tmpList[tmpList.length-1];
    }
    return moduleList;
}

// 获取webpack entry
function getBuildEntry(){
    const moduleList = getModuleList();
    let entry = {};
    for(let index in moduleList){
        const moduleName = moduleList[index]
        entry[moduleName] = "./src/modules/" + moduleName + "/index.js"
    }
    // 额外添加./src/index的配置(把这个也当做一个页面)
    entry["app"] = "./src/index.js"
    return entry
}
module.exports = {
    getModuleList,
    getBuildEntry,
};