module.exports = function(loadModule, moduleName) {
    if (moduleName === 'Window') {
        loadModule.prototype.I_am_extend_function = function () {
            return 'I am extend function'
        }
    } else {
        return loadModule
    }
}
