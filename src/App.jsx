import React from 'react'
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import ResetPassword from './components/ResetPassword';
import ForgetPassword from './components/ForgetPassword';
import GithubCallback from './components/GithubCallback';
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/reset" element={<ResetPassword />} />
      <Route path="/forget" element={<ForgetPassword />} />
      <Route path="/github/callback" element={<GithubCallback />} />
    </Routes>
  )
}

export default App
