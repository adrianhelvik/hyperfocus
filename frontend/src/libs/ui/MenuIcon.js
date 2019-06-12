import styled from 'styled-components'
import * as theme from 'theme'
import React from 'react'

const MenuIcon = ({ onClick }) => (
  <MenuIcon.Container>
    <MenuIcon.Icon data-disable-drag className="material-icons" onClick={onClick}>menu</MenuIcon.Icon>
  </MenuIcon.Container>
)

MenuIcon.Container = styled.div`
`

MenuIcon.Icon = styled.i`
  font-size: 15px;
  background-color: ${theme.ui3};
  border-radius: 5px;
  padding: 4px;
  color: #333;
  cursor: pointer;
`

export default MenuIcon
