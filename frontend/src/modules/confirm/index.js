import React from 'react'
import ReactDom from 'react-dom'

import HomePage from "./pages/home"

class App extends React.Component {

    render(){
        return (
            <HomePage/>
        )
    }
}

ReactDom.render(<App/>,document.getElementById("app"))
