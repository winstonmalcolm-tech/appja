import { useEffect, useReducer, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BsFillSendFill } from "react-icons/bs";
import io from "socket.io-client";
import axios from 'axios';
import useAxios from '../../utils/useAxios';
import CommentCard from '../../components/CommentCard/CommentCard';
import { TokenContext } from '../../contexts/tokenContextProvider';
import { toast } from 'react-toastify';
import {format} from 'date-fns';
import { FaShareAlt } from "react-icons/fa";
import { CircleLoader } from 'react-spinners';

const socket = io.connect(`${import.meta.env.VITE_BASE_SERVER_URL}`);


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

const AppDetail = () => {
  const api = useAxios();
  const {tokens, logout} = useContext(TokenContext);

  const [state, dispatch] = useReducer(userReducer, INITIAL_STATE);
  const navigate = useNavigate();

  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [data, setData] = useState(null);
  const [comment, setComment] = useState("");

  const downloadFile = async () => {
    try {
      setIsDownloading(true);
      let response = await axios.get(data.app.app_url);

      const fileUrl = data.app.app_url;
      const fileName = data.app.app_name;

      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);

      response = await api.post(`app/download/${id}`, {developerId: data.app.developer_id});

      toast.info(response.data.message);

    } catch(error) {
      console.log(error);
    } finally {
      setIsDownloading(false);
    }

  }

  const sendComment = async () => {
    try {

      if (!tokens) {
        return toast.error("You are not signed in");
      }

      if (!comment) {
        return toast.info("Please enter text");
      }
  
      setComment("");
  
      socket.emit("send-review", {room_id: id, review_text: comment, username: state.user.username, first_name: state.user.first_name, last_name: state.user.last_name, profile_image: state.user.profile_image, developer_id: state.user.developer_id, review_date: format(new Date(), "MM/dd/yyyy")});
      const response = await api.post("/review/new", {appID: id, reviewText: comment});

      toast.success(response.data.message);

    } catch (error) {
      toast.info(error.response.data.message);
    }
  }

  const fetchUserData = async () => {

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
      console.log(error.message);
      toast.error(error.message);
      
    }
  }

  const appDetail = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_SERVER_URL}/app/${id}`);
      

      setData(response.data);

      if (tokens) {
        await fetchUserData();
      }

    } catch(error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    appDetail();

    socket.emit("join-room", id);
  
  }, []);

  
  useEffect(() => {
    
    if (!loading) {

      socket.on("receive-review", (comment) => {

        data.reviews.push(comment);
        const obj = {
          ...data,
          reviews: data.reviews
        }
        
        setData(obj);
      });
    }
    
  },[socket, loading]);

  

  if (loading) {
    return <center>Loading</center>
  }

  return (
    <div>
        <div className='flex items-center justify-between max-md:flex-col'>
          <div className='flex-auto w-fit h-52 flex gap-5 mt-11 max-md:flex-none max-md:flex-col max-md:h-fit max-md:items-center max-md:mb-10'>
            {/* Image container */}
            <div className='h-52 w-52 flex justify-center items-start bg-gradient-to-r from-custom-purple to-off-purple rounded-full'>
              <img className='w-full h-full object-cover object-top rounded-full' src={data.app.app_icon_url}/>
            </div>

            <div className='flex flex-col h-full justify-center max-md:items-center'>
              <h1 className='text-3xl mb-5'>{data.app.app_name}</h1>
              <Link to={`/developer/${data.app.developer_id}`} className='mb-3 text-gray-300 hover:text-blue-400 transition duration-300'>Creator @{data.app.username}</Link>
              <FaShareAlt onClick={() => {navigator.clipboard.writeText(`${window.location}`); toast.info("Url copied")}} className='cursor-pointer'/>
            </div>
          </div>

          <div className='flex-auto flex flex-col items-center max-md:flex-none max-md:mb-10'>
            <h1 className='text-2xl '>{data.app.app_size}MB</h1>
            <h1 className='text-gray-400 text-lg'>Size</h1>
          </div>

          <div className='flex-auto flex flex-col items-center max-md:flex-none max-md:mb-10'>
            <h1 className='text-2xl'>{data.app.number_of_downloads}</h1>
            <h1 className='text-gray-400 text-lg'># Of Downloads</h1>
          </div>

          <div className='flex-auto flex flex-col items-center max-md:flex-none'>
            { isDownloading ? <CircleLoader size={60} color="#cf70db" className='overflow-hidden'/> : <button onClick={downloadFile} className='p-5 bg-purple-500 text-white text-lg rounded-lg'>Download</button>}
          </div>
        </div>

        <div className='w-3/4 mt-20 max-md:w-full'>
          <h1 className='mb-2 text-4xl h-fit text-purple-500 w-fit overflow-hidden'>Description</h1>
          <hr className='w-3/4 bg-gray-400 border-none h-[1px] mb-5'/>

          <p>{data.app.app_description}</p>
        </div>


        <div className='mt-20 flex flex-wrap gap-5 max-md:justify-center'>
          {data.media.map((image, i) => <img key={i} className='w-64 h-84 object-fit object-center' src={image.image_url} />)}
        </div>


        <h1 className='mt-20 w-fit mb-2 text-4xl text-purple-500 overflow-hidden'>Reviews</h1>
        <hr className='w-3/4 bg-purple-500 border-none h-[1px] mb-5'/>

        <div className='w-3/4 max-md:w-full'>
          <div className='w-full h-96 pr-4 mb-4'>
            {data.reviews.length < 1 ? <h1>No reviews</h1> : data.reviews.map((review, i) => <CommentCard key={i} review={review}/>)}
          </div>
          
          <div className='w-full h-12 flex items-center border-2 border-purple-600 rounded-lg p-2'>
            <input type="text"  className='flex-1 h-full bg-transparent outline-none pl-3' value={comment} onChange={(e) => setComment(e.target.value)} placeholder='Leave a comment...'/>
            <BsFillSendFill className='h-full cursor-pointer' onClick={sendComment}/>
          </div>
        </div>
      
    </div>
  )
}

export default AppDetail