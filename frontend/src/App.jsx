import './App.css'
import './index.css'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer';
import { useContext } from 'react';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { Explore, Pricing, About, Home, DeveloperDetail, AppDetail, Purchase, SignIn, SignUp, NotFound, Profile, Upload, EditApp, EditProfile, ProtectedRoutes, CompleteOrder, Verified } from "./pages/index.js";
import { TokenContext } from './contexts/tokenContextProvider.jsx';

function App() {
  const { pathname } = useLocation();
  const { tokens } = useContext(TokenContext);
  return (
    <div className="app-container">
      {pathname == "/upload" ? null : <Navbar />}
      <Routes>
        <Route path='/' element={tokens ? <Navigate replace={true} to="/profile" /> : <Home />} />
        <Route path='/explore' element={<Explore />} />
        <Route path='/about' element={<About />} />
        <Route path='/pricing' element={<Pricing />} />
        <Route path='/verified' element={<Verified />} />

        <Route element={<ProtectedRoutes />}>
          <Route path='/profile' element={<Profile />} />
          <Route path='/edit' element={<EditProfile />} />
          <Route path='/purchase' element={<Purchase />} />
          <Route path="/complete-order" element={<CompleteOrder />} />

          <Route path="/apps">
            <Route path='new' element={<Upload />} />
            <Route path="edit/:appId" element={<EditApp />} />
          </Route>
        </Route>

        <Route path='/developer'>
          <Route path=":id" element={<DeveloperDetail />} />
        </Route>

        <Route path='/apps/:id' element={<AppDetail />} />


        <Route path='/auth'>
          <Route path='login' element={<SignIn />} />
          <Route path='register' element={<SignUp />} />
        </Route>
        <Route path='*' element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App;
