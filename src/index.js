import * as Anvoy from 'anvoy';
import * as mobx from 'mobx';

let {extend} = Anvoy.utils;

export default function(Component, getProps = () => {}) {
    return class extends Anvoy.Component {
        constructor() {
            super(...arguments);
            let coreInstance = this.__coreInstance;
            this._setRef = this._setRef.bind(this);
            this._ref = null;
            this._reaction = new mobx.Reaction(Component.name, () => Anvoy.scheduleUpdate(this));
            let reaction = this._reaction;
            let origInitialize = coreInstance.initialize.bind(coreInstance);
            let origUpdate = coreInstance.update.bind(coreInstance);

            coreInstance.initialize = function() {
                reaction.track(origInitialize);
            };

            coreInstance.update = function() {
                reaction.track(origUpdate);
            };
        }

        willUnmount() {
            this._reaction.dispose();
        }

        getRef() {
            return this._ref;
        }

        _setRef(ref) {
            this._ref = ref;
        }

        render(props) {
            let additionalProps = getProps(props);
            let finalProps = additionalProps ? extend({}, props, additionalProps) : props;
            let desc = Anvoy.create(Component, finalProps);
            desc.ref = this._setRef;
            return desc;
        }
    };
};
