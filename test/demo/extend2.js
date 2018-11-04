module.exports = function(loadModule, moduleName) {
    if (moduleName === 'Window') {
        loadModule.prototype.I_am_another_extend_function = function () {
            return 'I am another extend function'
        }
    } else {
        return loadModule
    }
}