import * as theme from '../theme'
import React from 'react'

const style = (e, s) => Object.assign(e.style, s)

class Loading extends React.Component {
  componentDidMount() {
    this.element = document.createElement('div')
    document.body.appendChild(this.element)

    style(this.element, {
      backgroundColor: theme.ui2,
      position: 'fixed',
      bottom: 0,
      right: 0,
      left: 0,
      top: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      color: 'white',
      fontSize: '20px',
      flexDirection: 'column',
      opacity: '1',
      transition: 'opacity .5s',
    })

    let s = 100

    this.interval = setInterval(() => {
      s += 10
      const circle = document.createElement('div')

      style(circle, {
        position: 'absolute',
        backgroundColor: 'rgba(255, 255, 255, .8)',
        borderRadius: '10000px',
        transition: 'transform .5s, background-color 3s',
        transform: 'scale(0)',
        height: `${s}px`,
        width: `${s}px`,
      })

      this.element.appendChild(circle)

      setTimeout(() => {
        style(circle, {
          transform: 'scale(1)',
          backgroundColor: 'rgba(255, 255, 255, 0)',
        })
      }, 20)

      setTimeout(() => {
        this.element.removeChild(circle)
      }, 10000)
    }, 800)


    document.addEventListener('click', () => {
      this.componentWillUnmount()
    })
  }

  componentWillUnmount() {
    clearInterval(this.interval)

    const circle = document.createElement('div')
    this.element.appendChild(circle)

    style(circle, {
      position: 'absolute',
      backgroundColor: 'rgba(255, 255, 255, .8)',
      borderRadius: '10000px',
      transition: 'transform 1s, background-color 1s',
      transform: 'scale(0)',
      height: '2000px',
      width: '2000px',
    })

    setInterval(() => {
      style(circle, {
        transform: 'scale(1)',
        backgroundColor: 'rgba(255, 255, 255, 1)',
      })
    }, 20)

    style(this.element, {
      opacity: '0',
      pointerEvents: 'none',
    })

    setTimeout(() => {
      if (this.element.parentNode)
        this.element.parentNode.removeChild(this.element)
    }, 500)
  }

  render() {
    return null
  }
}

export default Loading
