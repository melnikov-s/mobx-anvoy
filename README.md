# mobx-anvoy

Official [Anvoy](https://github.com/melnikov-s/anvoy) bindings for [Mobx](https://github.com/mobxjs/mobx).

## Installation

npm:

```
npm install --save mobx-anvoy
```

UMD bundle:

[https://unpkg.com/mobx-anvoy/lib/mobx-anvoy.js](https://unpkg.com/mobx-anvoy/lib/mobx-anvoy.js)

## Usage

### observe

`observe(Component, [mapStateToProps])`

Higher ordered component that converts an Anvoy component into a reactive component. An optional second argument is `mapStateToProps` function. Which will accept the components own props and be called each time the component updates. The result must be a plain object and will be merged with the component props. `mapStateToProps` is only to be used when using mobx as a single state atom in order to allow for the injection of props that do not have to be explicitly passed down by the parent component.

## Example

```javascript
import {Component, render, create, unmount} from 'anvoy';
import {observable} from 'mobx';
import observe from 'mobx-anvoy';

let state = observable({
    prop: 'valueB'
});

class MyComponent extends Component {
    willUpdate() {
        incX();
    }
    static el() {
        return `<div></div>`;
    }
    render(props) {
        return {root: {text: props.state.prop}};
    }
}

render(create(observe(Root), {state}), document.body);
```

# License

The MIT License (MIT)

Copyright (c) 2016 Sergey Melnikov

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
