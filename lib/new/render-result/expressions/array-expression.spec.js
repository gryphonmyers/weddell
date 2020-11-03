import test from "ava";
import { ArrayExpression } from "./array-expression";

test('Array expression works as expected', t => {
    t.is(
        `${new ArrayExpression(1,2,3,4,5)}`,
        '12345'
    );
})