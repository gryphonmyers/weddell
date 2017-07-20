var includes = require('./includes');
module.exports = function(arr1, arr2) {
    return Array.from(arguments).slice(1).reduce(function(finalArr, currArr){
        return finalArr.concat(currArr.reduce(function(currFinalArr, currVal){
            if (!includes(arguments[0], currVal)) {
                return currFinalArr.concat(currVal);
            }
            return currFinalArr;
        }, []));
    }, []);
};
