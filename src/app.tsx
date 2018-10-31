import React from 'react'
import {Router, Link, withSiteData} from 'react-static'
import { hot } from 'react-hot-loader'

import Routes from 'react-static-routes'
import {MetaTags} from "./components/seo";

// import './app.css'

const App = (props) => (
  <Router>
    <div>
        <MetaTags />
      <nav>
        <Link exact to="/">amir houieh</Link>
      </nav>
        <p dangerouslySetInnerHTML={{__html: props.siteData.description}}/>
      <div>
        <Routes />
      </div>
    </div>
  </Router>
);

export default hot(module)(withSiteData(App))
