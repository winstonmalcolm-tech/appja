import React, { useContext, useEffect, useReducer } from 'react';
import { toast } from "react-toastify";
import { useNavigate, Link } from 'react-router-dom';
import "../../index.css";
import useAxios from '../../utils/useAxios';
import { TokenContext } from '../../contexts/tokenContextProvider'; 
import AppCard from '../../components/AppCard/AppCard';


const INITIAL_STATE = {
  loading: true,
  user: {},
  apps: [],
  socials: []
}

const userReducer = (state, action) => {

  switch(action.type) {
    case "ADD_USER": {
      return {
      ...state,
      loading: false,
      user: action.payload,
    };
  }

    case "ADD_APPS" : {
        return {
            ...state,
            loading: false,
            apps: action.payload
          }
      }

    case "ADD_SOCIALS": {
        return {
        ...state,
        loading: false,
        socials: action.payload
      }
    }

    default: return state;
  }

}

const Profile = () => {

    const [state, dispatch] = useReducer(userReducer, INITIAL_STATE);
    const navigate = useNavigate();
    const { tokens, logout } = useContext(TokenContext);

    const api = useAxios()

    const fetchUserData = async (api) => {

      try {

        const response = await api.get("/developer");

        if (response.status == 403) {
          toast.error(`Something Happened`);
          logout()
          navigate("/auth/login");
          return;
        }
    
        dispatch({type: "ADD_USER", payload: response.data.user});
        dispatch({type: "ADD_APPS", payload: response.data.apps});
        dispatch({type: "ADD_SOCIALS", payload: response.data.socials});

        
    
      } catch (error) {
        toast.error(error.message);
        
      }
    }

    
    useEffect(() => {
      fetchUserData(api);
    }, []);

    if (state.loading) return <h1>Loading</h1>;

  return (
    <div>
      <div className='flex max-md:flex-col max-md:items-center'>
        <div className='flex-1 w-full h-52 flex gap-5 mt-11  max-md:flex-col max-md:items-center'>
          {/* Image container */}
          <div className='h-52 w-52 flex justify-center items-start bg-gradient-to-r from-custom-purple to-off-purple rounded-full'>
            {!state.user.profile_image ? <h1 className='flex justify-center items-center h-full w-full text-6xl'>{state.user.first_name.charAt(0).toUpperCase()}{state.user.last_name.charAt(0).toUpperCase()}</h1> : <img className='w-full h-full object-cover object-top rounded-full' src={state.user.profile_image}/>}
          </div>

          <div className='flex flex-col h-full justify-center'>
            <h1 className='text-3xl max-[981px]:text-xl'>{state.user.first_name} {state.user.last_name}</h1>
            <h4 className='text-gray-300'>@{state.user.username}</h4>
            {state.user.plan == "Hobbyist" ? <h5 className='mb-10 text-gray-300'>Hobbyist Plan - <Link to="/purchase" className='text-purple-600 hover:text-purple-400 transition duration-300'>Upgrade</Link></h5> : <h5 className='mb-10'>Standard Plan</h5>}
            <Link to={"/edit"} className="p-2 border-2 bg-transparent rounded-xl text-center">Edit Profile</Link>
          </div>
        </div>

        <div className='flex-1 flex w-full justify-end items-center max-md:flex-none max-md:mt-10 max-md:justify-center'>
          {state.user.plan == "Hobbyist" && state.apps.length == 3 ? <h1>You have reach the limit to upload, please upgrade or delete an app</h1> : <Link to="/apps/new" className="py-2 px-16 max-md:px-10 hover:bg-custom-purple hover:border-none border-2 transition duration-300 bg-transparent rounded-xl text-center">New app +</Link>}
        </div>
      </div>
      
      <div className='mt-32 flex flex-wrap gap-8 justify-center'>

        {state.apps.length < 1 ? <h1 className='text-2xl'>No apps</h1> : state.apps.map((app, i) => <AppCard key={i} app={app} developerId={app.developer_id} />)}
      </div>
    </div>
  )
}

export default Profile