import ReactDOM from 'react-dom'

export default template => {
  const root = document.createElement('div')
  document.body.appendChild(root)
  ReactDOM.render(template, root)
  return {
    remove: () => {
      ReactDOM.unmountComponentAtNode(root)
      root.parentNode.removeChild(root)
    },
    rerender: template => {
      ReactDOM.render(template, root)
    },
  }
}
