import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

import AAA from './aaa.jsx'
import BBB from './bbb.jsx'

export default class App extends Component {
    render() {
        return (
            <Router>
                <div>
                    <ul className="tabbar">
                        <li><Link className="link" to="/h5-to-miniprogram/aaa">aaa</Link></li>
                        <li><Link className="link" to="/h5-to-miniprogram/bbb">bbb</Link></li>
                    </ul>
                    <Route path="/h5-to-miniprogram/aaa" component={AAA}></Route>
                    <Route path="/h5-to-miniprogram/bbb" component={BBB}></Route>
                </div>
            </Router>
        );
    }
}
