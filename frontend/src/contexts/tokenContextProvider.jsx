import { useState, useEffect, createContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from "axios";

const TokenContext = createContext();

const loadCache = () => {
    const tokens = localStorage.getItem("tokens");

    return tokens ? JSON.parse(tokens) : null;
}


const TokenContextProvider = ({ children }) => {

    const [tokens, setTokens] = useState(loadCache());
    const navigate = useNavigate();

    const logout = async (message = "Logout successful") => {

        try {
            
             await axios.post(
                `${import.meta.env.VITE_BASE_SERVER_URL}/auth/logout`, 
                {
                    refreshToken: tokens.refreshToken
                }, 
                {
                    headers: `Bearer ${tokens.accessToken}`
                }
            );
            
            localStorage.clear();
            setTokens(null);
            toast.info(message);
            navigate("/");

        } catch(error) {
            console.log(error)
            //toast.error(`${error.response.data.message}`);
        }
    }


    useEffect(() => {
        localStorage.setItem("tokens", JSON.stringify(tokens));
    }, [tokens]);

    return (
        <TokenContext.Provider value={{tokens, setTokens, logout}}>
            { children }
        </TokenContext.Provider>
    )
}

export {TokenContextProvider, TokenContext}