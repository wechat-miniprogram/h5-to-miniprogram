import React from 'react';
import { render } from 'react-dom';

import App from './app.jsx';

const rootEl = document.getElementById('app');

render(
    <App />,
    rootEl
);