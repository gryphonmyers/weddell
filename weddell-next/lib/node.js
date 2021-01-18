import { createStoreClass } from "./store/create-store-class.js";
import { createNodeComponentClass } from "./component/create-node-component-class.js";
import { createNodeRenderResultClass } from "./render-result/create-node-render-result-class.js";
import { createObservableClass } from "./observable/create-observable-class.js";
import { createPushableObservableClass } from "./observable/create-pushable-observable-class.js";
import { createComputedStateClass } from "./store/create-computed-state-class.js";
import { createReactiveStateClass } from "./store/create-reactive-state-class.js";

const Observable = createObservableClass();
const PushableObservable = createPushableObservableClass({ Observable });
const RenderResult = createNodeRenderResultClass({});
const ReactiveState = createReactiveStateClass({Error, PushableObservable });
const ComputedState = createComputedStateClass({ ReactiveState });
const Store = createStoreClass({ PushableObservable, Error, ReactiveState, ComputedState });
const Component = createNodeComponentClass({Store, PushableObservable, Error, RenderResult});

export { Component };