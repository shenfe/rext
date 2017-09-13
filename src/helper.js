function PromiseDecor(Prom, executor) {
    this.promise = new Prom(executor);
}
PromiseDecor.prototype.success =
    PromiseDecor.prototype.always =
    PromiseDecor.prototype.complete =
    PromiseDecor.prototype.then = function () {
        var args = [].slice.call(arguments);
        this.promise = this.promise.then.apply(this.promise, args);
        return this;
    };
PromiseDecor.prototype.error =
    PromiseDecor.prototype['catch'] = function () {
        var args = [].slice.call(arguments);
        this.promise = this.promise['catch'].apply(this.promise, args);
        return this;
    };

function promiseWrap(send) {
    return function promiseWrap(options) {
        var args = [].slice.call(arguments);
        var ret = send.apply(null, args);
        if (!options.promise) return ret;

        return new PromiseDecor(options.promise, function (resolve, reject) {
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
