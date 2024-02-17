import { observer } from "mobx-react";
import { observable } from "mobx";
import Deck from "./Deck";
import React from "react";

@observer
class Portal extends React.Component {
    @observable error = null;

    componentDidCatch(error) {
        console.error(error);
        this.error = error;
    }

    render() {
        if (this.error) return <div>An error occurred</div>;
        return <Deck {...this.props} />;
    }
}

export default Portal;
