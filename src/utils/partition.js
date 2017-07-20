module.exports = function(arr, func) {
    return arr.reduce(function(finalArr, val){
        if (func(val)) {
            finalArr[0].push(val);
        } else {
            finalArr[1].push(val);
        }
        return finalArr;
    }, [[], []]);
};
