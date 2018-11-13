import React, { Component } from 'react';

import Btn from './btn.jsx'
import Content from './content.jsx'

export default class App extends Component {
    constructor() {
        super();

        this.state = {
            count: 1,
            text: 'add',
        };
        this.add = this.add.bind(this);
    }

    add() {
        this.setState({
            count: this.state.count + 1,
        });
    }

    render() {
        return (
            <div>
                <Content count={this.state.count}></Content>
                <Btn text={this.state.text} add={this.add}></Btn>
            </div>
        );
    }
}
