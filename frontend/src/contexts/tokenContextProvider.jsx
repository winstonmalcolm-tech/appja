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
            if (tokens) {
                await axios.post(
                    `${import.meta.env.VITE_BASE_SERVER_URL}/auth/logout`,
                    {
                        refreshToken: tokens.refreshToken
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${tokens.accessToken}`
                        }
                    }
                );
            }
        } catch (error) {
            console.error("Backend logout failed:", error);
        } finally {
            localStorage.clear();
            setTokens(null);
            toast.info(message);
            navigate("/");
        }
    }


    useEffect(() => {
        localStorage.setItem("tokens", JSON.stringify(tokens));
    }, [tokens]);

    return (
        <TokenContext.Provider value={{ tokens, setTokens, logout }}>
            {children}
        </TokenContext.Provider>
    )
}

export { TokenContextProvider, TokenContext }