module.exports = function(arr) {
    return arr.reduce((acc, item) => acc.includes(item) ? acc : acc.concat(item), []);
}