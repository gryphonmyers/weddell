export function difference(setA, setB) {
    if (Array.isArray(setB)) setB = new Set(setB);
    let newSet = new Set(setA)
    for (let elem of setB) {
        newSet.delete(elem)
    }
    return newSet
}