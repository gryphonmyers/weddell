module.exports = (arr, func) =>
    arr.reduce((final,val) =>
        final.concat(func(val)), [])
