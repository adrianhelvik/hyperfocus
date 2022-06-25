import styled from 'styled-components'
import * as theme from 'theme'
import React from 'react'

const MenuIcon = ({ onClick }) => (
  <MenuIcon.Container>
    <MenuIcon.Icon
      data-disable-drag
      className="material-icons"
      onClick={onClick}
    >
      menu
    </MenuIcon.Icon>
  </MenuIcon.Container>
)

MenuIcon.Container = styled.div``

MenuIcon.Icon = styled.i`
  transition: background-color 0.3s;
  font-size: 15px;
  background-color: white;
  border-radius: 5px;
  padding: 4px;
  color: #333;
  cursor: pointer;
  box-shadow: ${theme.shadows[0]};
  :active:hover {
    background-color: rgb(200, 200, 200);
  }
`

export default MenuIcon
