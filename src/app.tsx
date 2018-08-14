import React from 'react'
import {Router, Link, withSiteData} from 'react-static'
import { hot } from 'react-hot-loader'

import Routes from 'react-static-routes'

// import './app.css'

const App = (props) => (
  <Router>
    <div>
      <nav>
        <Link exact to="/">amir houieh</Link>
      </nav>
        <p dangerouslySetInnerHTML={{__html: props.description}}/>
      <div>
        <Routes />
      </div>
    </div>
  </Router>
);

export default hot(module)(withSiteData(App))
