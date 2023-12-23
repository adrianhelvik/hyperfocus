export default function withMenu() {
    return {
        showMenu(_event: MouseEvent, _options: Record<string, () => void>) {
        // TODO
        },
    };
}

/*
import styled, { keyframes } from 'styled-components'
import hoist from 'hoist-non-react-statics'
import withEvents from 'util/withEvents'
import { Portal } from 'react-portal'
import { observer } from 'mobx-react'
import onSelect from 'util/onSelect'
import * as zIndexes from 'zIndexes'
import { observable } from 'mobx'
import * as theme from 'theme'
import React from 'react'

export default WrappedComponent => {
  const openMenus = []

  @withEvents
  @observer
  class NewComponent extends React.Component {
    static displayName = `withMenu(${
      WrappedComponent.displayName || WrappedComponent.name
    })`
    static WrappedComponent =
      WrappedComponent.WrappedComponent || WrappedComponent

    @observable.ref menu = null
    @observable options = null
    @observable x = null
    @observable y = null

    componentDidMount() {
      this.props.on(document, 'click', event => {
        if (this.menu && !this.menu.contains(event.target)) this.closeMenu()
      })
    }

    componentWillUnmount() {
      const index = openMenus.indexOf(this)
      if (index > -1) openMenus.splice(index, 1)
      clearTimeout(this.showMenuTimeout)
    }

    showMenu = (event, options) => {
      clearTimeout(this.showMenuTimeout)
      this.showMenuTimeout = setTimeout(() => {
        openMenus.forEach(menu => {
          menu.closeMenu()
        })
        openMenus.push(this)
        this.x = event.clientX
        this.y = event.clientY
        this.options = options
      }, 100)
    }

    closeMenu = () => {
      console.log('closeMenu')
      this.options = null
      this.x = null
      this.y = null
      const index = openMenus.indexOf(this)
      if (index > -1) openMenus.splice(index, 1)
    }

    selectItem = e => {
      const key = e.target.getAttribute('data-key')
      this.options[key](e)
      this.closeMenu()
    }

    render() {
      return (
        <React.Fragment>
          <WrappedComponent {...this.props} showMenu={this.showMenu} />
          {this.options && (
            <Portal>
              <MenuWrapper x={this.x} y={this.y} ref={e => (this.menu = e)}>
                {Object.keys(this.options).map((key, index) => (
                  <MenuItem
                    ref={e => index === 0 && e && e.focus()}
                    {...onSelect(this.selectItem)}
                    data-key={key}
                    key={key}
                  >
                    {key}
                  </MenuItem>
                ))}
              </MenuWrapper>
            </Portal>
          )}
        </React.Fragment>
      )
    }
  }

  hoist(NewComponent, WrappedComponent)

  return NewComponent
}

const MenuWrapper = styled.div`
  position: fixed;
  top: ${p => p.y}px;
  left: ${p => p.x}px;
  background: white;
  min-height: 4px;
  width: 150px;
  box-shadow: ${theme.shadows[1]};
  font-size: 0.8rem;
  color: #707070;
  border-radius: 4px;
  z-index: ${zIndexes.contextMenu};
  overflow: hidden;

  animation: ${keyframes`
    0% {
      max-height: 0;
    }
    100% {
      max-height: 600px;
    }
  `} 0.7s;
`

const MenuItem = styled.div`
  padding: 10px;
  cursor: pointer;
  :hover {
    background: ${theme.gray2};
  }
  :focus {
    outline: none;
  }

  :first-child {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }

  :last-child {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }
`
*/
