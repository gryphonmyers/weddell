module.exports = {
    template : function(CSSText){
        //TODO make this more efficient after compile time
        return function(locals){
            var reg = /var\(([^\\\)(]+)\)/g;
            var output = CSSText;
            while(output.match(reg)){
                output = output.replace(reg, function(fullMatch, group){
                    return group.split(',')
                        .map(function(str){
                            return str.trim();
                        })
                        .map(function(val){
                            return val.replace(/--(.*)/g, function(fullMatch, group){
                                if (group in locals) {
                                    return locals[group];
                                }
                                return '';
                            });
                        })
                        .reduce(function(finalVal, currVal){
                            return finalVal ? finalVal : currVal;
                        }, '');
                });
            }
            return output;
        }
    }
}
