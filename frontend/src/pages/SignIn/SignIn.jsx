import {useState, useContext} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BiShow, BiHide } from "react-icons/bi";
import "./signin.css";
import axios from 'axios';
import { toast } from 'react-toastify';
import { CircleLoader } from 'react-spinners';
import { TokenContext } from '../../contexts/tokenContextProvider';


const SignIn = () => {
  const [passwordStatus, setPasswordStatus] = useState(false);
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const { setTokens } = useContext(TokenContext);

  const [highlight, setHighLight] = useState(false);

  const signinFormSubmitHandler = async (e) => {
    e.preventDefault();

    try {

      if (identifier == "" || password == "") {
        toast.error("Please fill all fields.");
        return;
      }

      setLoading(true);

      const response = await axios.post(`${import.meta.env.VITE_BASE_SERVER_URL}/auth/login`, {email: identifier, password: password});

      toast.success(`${response.data.message}`);

      //console.log({accessToken: response.data.accessToken, refreshToken: response.data.refreshToken});
      setIdentifier("");
      setPassword("");
      
      //Set tokens to global context
      setTokens({accessToken: response.data.accessToken, refreshToken: response.data.refreshToken});

      navigate("/profile");

    } catch(error) {
      toast.error(`${error.response.data.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='signin_container'>
      <div className="signin_content">
        <div className="signin_heading">
            <h1>Log into your account</h1>

            <h5>Don&apos;t have an account? <Link to='/auth/register'>Sign up</Link></h5>
        </div>

        <div className="signin_form">
          <form onSubmit={signinFormSubmitHandler}>

            <input className="signin_input" type="text" placeholder='Username or Email' value={identifier} onChange={(e) => setIdentifier(e.target.value)}/>

            <div className={`signin_password_container ${highlight ? "signin_password_container_active" : ""}`}>
              <input type={passwordStatus ? "text" : "password"} name='password' placeholder='password' value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setHighLight(true)} onBlur={() => setHighLight(false)} autoComplete='off'/>
              {passwordStatus ? <BiHide onClick={() => setPasswordStatus(!passwordStatus)} size={20}/> : <BiShow onClick={() => setPasswordStatus(!passwordStatus)} size={20} />}
            </div>
            
            { loading ? <CircleLoader size={60} color="#cf70db" className='signup_load_icon'/>: <button type="submit">Sign in</button>}

          </form>
        </div>
      </div>
    </div>
  )
}

export default SignIn