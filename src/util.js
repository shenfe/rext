function extend(target) {
    Array.prototype.slice.call(arguments, 1).forEach(function (source) {
        for (var p in source) {
            if (source.hasOwnProperty(p) && source[p] !== undefined)
                target[p] = source[p];
        }
    });
    return target;
}

function type(v) {
    var t = Object.prototype.toString.call(v);
    return t.substring('[object '.length, t.length - 1).toLowerCase();
}

export {
    extend,
    type
}
