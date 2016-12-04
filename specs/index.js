import {Component, render, create, unmount} from 'anvoy';
import {observable} from 'mobx';
import observe from '../src';

//force setTimeout fallback so we can use fake clock
window.requestAnimationFrame = false;
jasmine.clock().install();

describe("Mobx Anvoy", () => {
    let x;
    let y;
    let incX = () => x++;
    let incY = () => y++;
    let doc;

    beforeEach(() => {
        x = 0;
        y = 0;
        doc = document.createElement('div');
    });

    it("should pass props to the given component", () => {
        let Child = observe(class extends Component {
            willMount() {
                expect(this.props.prop).toBe('value');
                incX();
            }
        });

        let Root = class extends Component {
            render(props) {
                return create(Child, props);
            }
        };

        render(create(Root, {prop: 'value'}), doc);
        expect(x).toBe(1);
    });

    it("should be able to inject additional props", () => {
        let Child = observe(class extends Component {
            willMount() {
                expect(this.props.propA).toBe('valueA');
                expect(this.props.propB).toBe('injectedB');
                incX();
            }
        }, (props) => {
            expect(props.propA).toBe('valueA');
            expect(props.propB).toBe('valueB');
            incY();
            return {propB: 'injectedB'};
        });

        let Root = class extends Component {
            render(props) {
                return create(Child, props);
            }
        };

        render(create(Root, {propA: 'valueA', propB: 'valueB'}), doc);
        expect(x).toBe(1);
        expect(y).toBe(1);
    });

    it("should return a reference to the underlying connected component when using `ref`", () => {
        let ref;
        let Child = observe(class extends Component {
            willMount() {
                this.correctRef = true;
            }
        });

        let Root = class extends Component {
            render(props) {
                let desc = create(Child, props);
                desc.ref = (r) => ref = r;
                return desc;
            }
        };

        render(create(Root, {prop: 'value'}), doc);
        expect(ref.correctRef).toBe(true);
    });

    it("should subscribe components to mobx state changes", () => {
        let stateA = observable({
            prop: 'valueA'
        });

        let stateB = observable({
            prop: 'valueB'
        });

        let Child = observe(class extends Component {
            willUpdate() {
                incX();
            }
            static el() {
                return `<div></div>`;
            }
            render({stateB}) {
                return {root: {text: stateB.prop}};
            }
        });

        let Root = observe(class extends Component {
            willUpdate() {
                incY();
            }

            static el() {
                return `
                    <div>{@content} <@child/></div>
                `;
            }

            render({stateA, stateB}) {
                return {
                    content: stateA.prop,
                    child: create(Child, {stateB})
                };
            }
        });

        render(create(Root, {stateA, stateB}), doc);
        let el = doc.firstChild;

        expect(el.textContent).toBe('valueA valueB');
        stateA.prop = 'newValueA';
        expect(el.textContent).toBe('valueA valueB');
        expect(x).toBe(0);
        expect(y).toBe(0);
        jasmine.clock().tick(1);
        expect(el.textContent).toBe('newValueA valueB');
        expect(x).toBe(1);
        expect(y).toBe(1);
        stateB.prop = 'newValueB';
        jasmine.clock().tick(1);
        expect(el.textContent).toBe('newValueA newValueB');
        expect(x).toBe(2);
        expect(y).toBe(1);
    });

    it("should unsubscribe from mobx when unmounting", () => {
        let state = observable({
            prop: 'valueA'
        });

        let Root = observe(class extends Component {
            willUpdate() {
                incY();
            }
            static el() {
                return `<div></div>`;
            }
            render({state}) {
                return {root: {text: state.prop}};
            }
        });

        render(create(Root, {state}), doc);
        unmount(doc);
        spyOn(console, 'warn');
        state.prop = 'newValue';
        jasmine.clock().tick(1);
        expect(console.warn).not.toHaveBeenCalled();
        expect(y).toBe(0);
    });

    it("should prevent double updates", () => {
        let state = observable({
            prop: 'value'
        });

        let Child = observe(class extends Component {
            willMount() {
                incX();
            }

            willUpdate() {
                incX();
            }

            static el() {
                return `<div></div>`;
            }

            render({state}) {
                return {root: {text: state.prop}};
            }
        });

        let Root = observe(class extends Component {
            willMount() {
                incY();
            }
            willUpdate() {
                incY();
            }
            static el() {
                return `<div>{@content}<@child/></div>`;
            }
            render({state}) {
                return {
                    content: state.prop,
                    child: create(Child, {state})
                };
            }
        });

        render(create(Root, {state}), doc);
        let el = doc.firstChild;
        expect(x).toBe(1);
        expect(y).toBe(1);
        state.prop = 'newValueA';
        jasmine.clock().tick(1);
        expect(x).toBe(2);
        expect(y).toBe(2);
        expect(el.textContent).toBe('newValueAnewValueA');
        state.prop = 'newValueB';
        jasmine.clock().tick(1);
        expect(x).toBe(3);
        expect(y).toBe(3);
        expect(el.textContent).toBe('newValueBnewValueB');
    });

    it("should always updates connected components when store state changes", () => {
        let state = observable({
            prop: 'valueA'
        });

        let Child = observe(class extends Component {
            willUpdate() {
                incX();
            }
            static el() {
                return `<div></div>`;
            }
            render({state}) {
                return {root: {text: state.prop}};
            }
        });

        let Root = observe(class extends Component {
            willUpdate() {
                incY();
            }
            shouldUpdate() {
                return false;
            }
            static el() {
                return `<div>{@content}<@child/></div>`;
            }
            render({state}) {
                return {
                    content: state.prop,
                    child: create(Child, {state})
                };
            }
        });

        render(create(Root, {state}), doc);
        let el = doc.firstChild;
        expect(el.textContent).toBe('valueAvalueA');
        state.prop = 'newValueA';
        jasmine.clock().tick(1);
        expect(x).toBe(1);
        expect(y).toBe(0);
        expect(el.textContent).toBe('valueAnewValueA');
    });

    it("should not update top level components when state change only concerns children", () => {
        let state = observable({
            prop: 'value'
        });

        let Child = observe(class extends Component {
            willUpdate() {
                incX();
            }
            static el() {
                return `<div></div>`;
            }
            render({state}) {
                return {root: {text: state.prop}};
            }
        });

        let Root = observe(class extends Component {
            willUpdate() {
                incY();
            }
            static el() {
                return `<div><@child/></div>`;
            }
            render({state}) {
                return {
                    child: create(Child, {state})
                };
            }
        });

        render(create(Root, {state}), doc);
        let el = doc.firstChild;
        expect(x).toBe(0);
        expect(y).toBe(0);
        state.prop = 'newValueA';
        jasmine.clock().tick(1);
        expect(x).toBe(1);
        expect(y).toBe(0);
        expect(el.textContent).toBe('newValueA');
    });
});
