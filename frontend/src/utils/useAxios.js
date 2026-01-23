import axios from "axios";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";
import { useContext } from "react";
import { TokenContext } from "../contexts/tokenContextProvider";

//This is used to update the context - global state
const useAxios = () => {
    const { setTokens, logout, tokens } = useContext(TokenContext);

    const axiosInstance = axios.create({
        baseURL: import.meta.env.VITE_BASE_SERVER_URL,
        headers: {
            Authorization: tokens ? `Bearer ${tokens.accessToken}` : ""
        }
    });

    axiosInstance.interceptors.request.use(async (req) => {

        if (!tokens) {
            return req;
        }

        //Decode the jwt token 
        const decodedToken = jwtDecode(tokens.accessToken);

        //Check if token expired by comparing the expiration date from the token to current date using dayjs package
        const isExpired = dayjs.unix(decodedToken.exp).diff(dayjs()) < 1;

        //If token is not expired continue with the request
        if (!isExpired) return req;

        try {
            const response = await axios.post(`${import.meta.env.VITE_BASE_SERVER_URL}/auth/refresh_token`, { refreshToken: tokens.refreshToken });

            if (response.status === 200) {
                setTokens({ ...tokens, accessToken: response.data.accessToken });
                req.headers.Authorization = `Bearer ${response.data.accessToken}`;
            }
        } catch (error) {
            if (error.response && error.response.status === 403) {
                logout("Session expired, please sign in again");
            }
            return Promise.reject(error);
        }

        //Continue with the request
        return req;
    });

    axiosInstance.interceptors.response.use(
        (res) => {
            return res;
        },
        (error) => {
            if (error.response && error.response.status === 401) {
                logout(error.response.data.message || "Session expired");
            }
            return Promise.reject(error);
        }
    )


    return axiosInstance;
}



export default useAxios;

