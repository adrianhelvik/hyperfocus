import Deck, { DeckProps } from "./Deck";
import { observer } from "mobx-react";
import { observable } from "mobx";
import React from "react";

type Props = DeckProps;

@observer
class Portal extends React.Component<Props> {
  @observable error: Error | null = null;

  componentDidCatch(error: Error) {
    console.error(error);
    this.error = error;
  }

  render() {
    if (this.error) return <div>An error occurred</div>;
    return <Deck {...this.props} />;
  }
}

export default Portal;
