import AbstractTextArea from "react-textarea-autosize";
import type DeckModel from "src/libs/store/Deck";
import React, { ChangeEvent } from "react";
import { observer } from "mobx-react";
import api from "src/libs/api";
import styled from "styled-components";

@observer
class EditDeckTitle extends React.Component<{ deck: DeckModel }> {
  saveTimeout: ReturnType<typeof setTimeout> | undefined;

  onChange = (event: ChangeEvent) => {
    if (!(event.target instanceof HTMLInputElement)) return;
    this.props.deck.title = event.target.value;
    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      api.setDeckTitle({
        deckId: this.props.deck.deckId,
        title: this.props.deck.title,
      });
    }, 300);
  };

  render() {
    return <TextArea onChange={this.onChange} value={this.props.deck.title} />;
  }
}

export default EditDeckTitle;

const TextArea = styled(AbstractTextArea as any /* TODO: Fix types */)`
  background-color: transparent;
  font-size: inherit;
  color: inherit;
  display: block;
  resize: none;
  width: 80%;
  border: 0;
`;
