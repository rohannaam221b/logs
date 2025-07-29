import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Logsv1 from './Logsv1';
import Logsv2 from './Logsv2';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/v1" element={<Logsv1 />} />
        <Route path="/v2" element={<Logsv2 />} />
      </Routes>
    </Router>
  );
}

export default App;
