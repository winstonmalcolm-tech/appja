import Logo from "../../assets/logo.png";
import "./navbar.css";
import { NavLink, Link } from "react-router-dom";
import { useContext, useState } from "react";
import { TokenContext } from "../../contexts/tokenContextProvider";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoCloseSharp } from "react-icons/io5";

const Navbar = () => {

    const {logout, tokens} = useContext(TokenContext);
    
    const [showSideBar, setShowSideBar] = useState(false);
    return (
        <>
        <nav>
            <div className="navbar_left">
                <img src={Logo} alt="Logo" />
            </div>

            <div className="middle">
                <ul>
                    { !tokens && <NavLink to="/" className={({ isActive }) => isActive ? 'navbar_active' : 'navbar_unactive'}><li>Home</li></NavLink>}
                    <NavLink to="/explore" className={({ isActive }) => isActive ? 'navbar_active' : 'navbar_unactive'}><li>Explore</li></NavLink> 
                    { !tokens && <NavLink to="/pricing" className={({ isActive }) => isActive ? 'navbar_active' : 'navbar_unactive'}><li>Pricing</li></NavLink>}
                </ul>
            </div>

            <div className="navbar_right">
                {
                    (!tokens) ? (
                        <>
                            <Link to="/auth/register">Sign up</Link>
                            <Link to="/auth/login">Sign in</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/profile"> Profile </Link>
                            <button onClick={() => logout()}>Logout</button>
                        </>
                    )
                }
            </div>
            
            <div className="sidebar_icon_container">
                <GiHamburgerMenu size={30} onClick={() => setShowSideBar(true)}/>
            </div>
        </nav>
        
        {showSideBar == true ? <div className="h-dvh w-dvw z-[9] fixed top-0 left-0" onClick={() => setShowSideBar(false)}></div> : null}
        <div className={`side_bar ${showSideBar ? "show" : ""}`}>
            <ul>
                <li><IoCloseSharp size={40} onClick={() => setShowSideBar(false)}/></li>
                {!tokens && <NavLink to="/" className={({ isActive }) => isActive ? 'side_bar_active' : 'navbar_unactive'} onClick={() => setShowSideBar(false)}><li>Home</li></NavLink>}
                <NavLink to="/explore" className={({ isActive }) => isActive ? 'side_bar_active' : 'navbar_unactive'} onClick={() => setShowSideBar(false)}><li>Explore</li></NavLink> 
                { !tokens && <NavLink to="/pricing" className={({ isActive }) => isActive ? 'side_bar_active' : 'navbar_unactive'} onClick={() => setShowSideBar(false)}><li>Pricing</li></NavLink>}

                {
                    (!tokens) ? (
                        <>
                            <Link to="/auth/register" onClick={() => setShowSideBar(false)}><li>Sign up</li></Link>
                            <Link to="/auth/login" onClick={() => setShowSideBar(false)}><li>Sign in</li></Link>
                        </>
                    ) : (
                        <>
                            <Link to="/profile" onClick={() => setShowSideBar(false)}><li>Profile</li></Link>
                            <button onClick={() => {logout(); setShowSideBar(false);}}>Logout</button>
                        </>
                    )
                }
            </ul>
        </div>
        </>
    )
}

export default Navbar



/*


        */