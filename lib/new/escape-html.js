export default (str) => 
    str.replace(/[&<>"'`]/g, val => {
        switch (val) {
            case "&":
                return '&amp;';
            case ">":
                return '&gt;';
            case "<":
                return '&lt;';
            case '"':
                return '&quot;';
            case "'":
                return '&#39;';
            case "`":
                return '&#96;';
        }
    });