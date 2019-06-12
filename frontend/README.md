# Subtask frontend

## User interface
The user interface should allow creating boards, decks,
cards, card-boards and portals.

### Styles should be applied using styled-components
Styled components make it easier to convert between CSS
and well, styled components. Try to prevent the number
of styled components in a component file to become
too large.

Styles should be placed below the class declaration of
the primary component like this:

```javascript
import styled from 'styled-components'
import React from 'react'

class Message extends React.Component {
  render() {
    return (
      <Container>
        Hello world!
      </Container>
    )
  }
}

export default MyComponent

const Container = styled.div`
  background-color: tomato;
`
```

### No CSS variables. Use props and variables instead
By using styled components, CSS variables become unnecessary.
Use props instead.

```javascript
// Good
const Foo = styled.div`
  background-color: ${theme.primaryColor};
  color: ${theme.textColor};
  width: ${props => props.width};
`
```

### Components should be within the folder ui
Deeply nested component hierarchies only cause headaches.
Keep the components directly within the ui folder. If
the component is big enough to warrant a separate package,
implement it as a package. (Use Lerna for this). If the
component is small enough to be a styled component, keep
in the same file, below the default export.

## State

### No parent references
The state is stored in Mobx and should have a one-way flow.
This prevents a the code from becoming shitty and entangled
beyond belief. It's possibly the only thing I prefer with
Redux over Mobx.

```javascript
// Good:
deck.cards

// Bad:
card.parentDeck
```

### Own concerns only
The state should not contain state that is unrelated
to its own concern. If we take the example of navigation
relative to one model, it can be tempting to add the
navigation within the model. This is not a good idea.
Keep navigation state as observables in the React
components or use the root store.

## Reactivity

### Outbound reactions
Use reactions for communication with the backend. The
outbound reactive layer is responsive for emitting
events to notify the server of changes.

### Inbound reactions
Inbound reactions are triggered when another user edits
a shared resource. These action objects should be
timestamped and throttled. When committing the throttled
actions, they should be sorted by creation time. New
actions should be idle for at least 1s to prevent the
worst race conditions. Remote actions should be committed
every 3s.
