module.exports = function(s, ID) {
    //taken from http://stackoverflow.com/questions/3642035/jquerys-append-not-working-with-svg-element
    var div= document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
    div.innerHTML= '<svg xmlns="http://www.w3.org/2000/svg">'+s+'</svg>';
    var frag= document.createDocumentFragment();
    while (div.firstChild.firstChild) {
        div.firstChild.firstChild.id = ID;
        frag.appendChild(div.firstChild.firstChild);
    }
    return frag;
};