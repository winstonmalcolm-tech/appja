import {useContext} from 'react';
import { TokenContext } from '../contexts/tokenContextProvider';
import { Outlet, Navigate } from 'react-router-dom';

const ProtectedRoutes = () => {
    const { tokens } = useContext(TokenContext);

  return tokens ? <Outlet /> : <Navigate to="/"/> 
  
}

export default ProtectedRoutes