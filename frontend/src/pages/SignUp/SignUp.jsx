import { useState } from 'react'
import { Link } from "react-router-dom";
import { BiShow, BiHide } from "react-icons/bi";
import { toast } from 'react-toastify';
import axios from 'axios';
import { CircleLoader } from 'react-spinners';
import './signup.css';

const SignUp = () => {
    //firstName, lastName, email, username, password

    const [passwordStatus, setPasswordStatus] = useState(false);
    const [loading, setLoading] = useState(false);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [highlight, setHighLight] = useState(false);

    
    const submitFormHandler = async (e) => {
        e.preventDefault();

        try {

            if (firstName == "" || lastName == "" || email == "" || username == "" || password == "") {
                toast.error('Please fill all fields!')
                return;
            }
            setLoading(true);
    
            const response = await axios.post(`${import.meta.env.VITE_BASE_SERVER_URL}/auth/register`, {firstName, lastName, email, username, password});
            
            toast.success(`${response.data.message}`);
            setFirstName("");
            setLastName("");
            setEmail("");
            setUsername("");
            setPassword("");

        } catch (error) {
            toast.error(`${error.response.data.message}`);
            
        } finally {
            setLoading(false);
        }
        
    }

    return (
        <div className='signup_contatiner'>
            <div className="signup_content">
                <div className="signup_heading">
                    <h1>Create an Account</h1>

                    <h5>Already have an account? <Link to='/auth/login'>Log in</Link></h5>
                </div>

                <div className="signup_form">
                    <form onSubmit={submitFormHandler}>
                        <div className="signup_form_name">
                            <input className='signup_input' type="text" name='firstName' placeholder='First name' value={firstName} onChange={(e) => setFirstName(e.target.value)}/>
                            <input className='signup_input' type="text" name='lastName'placeholder='Last name' value={lastName} onChange={(e) => setLastName(e.target.value)}/>
                        </div>

                        <input className='signup_input' type="email" name='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)}/>
                        <input className='signup_input' type="text" name='username' placeholder='username'value={username} onChange={(e) => setUsername(e.target.value)}/>
                        
                        <div className={`signup_password_container ${highlight ? "signup_password_container_active" : ""}`}>
                            <input type={passwordStatus ? "text" : "password"} name='password' placeholder='password' value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setHighLight(true)} onBlur={() => setHighLight(false)}/>
                            {passwordStatus ? <BiHide onClick={() => setPasswordStatus(!passwordStatus)} size={20}/> : <BiShow onClick={() => setPasswordStatus(!passwordStatus)} size={20} />}
                        </div>
                        { loading ? <CircleLoader size={60} color="#cf70db" className='signup_load_icon'/>: <button type="submit">Sign up</button>}
                        
                    </form>
                </div>
            </div>
        </div>
    )
}

export default SignUp