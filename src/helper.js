function promiseWrap(send) {
    return function (options) {
        var ret = send.apply(null, arguments);
        if (!options.promise) return ret;

        var Prom = options.promise;
        return new Prom(function (resolve, reject) {
            ret.success(function (data) {
                resolve(data);
            });
            ret.error(function (data) {
                reject(data);
            });
        });
    };
}

export {
    promiseWrap
}
