import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import IndexView from './views';
import LoginView from './views/login';
import AssociateView from './views/login/associate';
import NotFoundView from './views/_notFound';

function App() {
  return <BrowserRouter>
    <Routes>
      <Route index element={<IndexView/>}/>
      <Route path="login">
        <Route index element={<LoginView/>}/>
        <Route path="associate" element={<AssociateView/>}/>
      </Route>
      <Route path="*" element={<NotFoundView/>}/>
    </Routes>
  </BrowserRouter>;
}

export default App;
