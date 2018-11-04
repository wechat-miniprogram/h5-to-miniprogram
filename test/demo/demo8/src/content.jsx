import React, { Component } from 'react';

export default class Content extends Component {
    constructor(props) {
        super();

        const count = props.count || 0

        this.state = {
            isEven: count % 2 === 0,
        };
    }

    componentWillReceiveProps(nextProps) {
        const count = nextProps.count || 0

        this.setState({
            isEven: count % 2 === 0,
        });
    }

    render() {
        return (
            <div>
                <span>this is a vue demo </span>
                {
                    this.state.isEven ? (<span className="even">even({this.props.count})</span>) : (<span className="odd">odd({this.props.count})</span>)
                }                
            </div>
        );
    }
}
