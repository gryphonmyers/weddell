module.exports = (arr1, arr2) =>
    arr1.reduce((final, val) =>
        arr2.indexOf(val) > -1 ? final.concat(val) : final
    , [])
