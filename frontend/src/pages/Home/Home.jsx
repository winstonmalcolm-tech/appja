import React from 'react'
import { Link } from 'react-router-dom';
import Developer from '../../assets/home_img.png';
import Mobile from '../../assets/mobile.png';
import Person from '../../assets/person_2.png';
import "./home.css";
import Accordian from '../../components/Accordian/Accordian';

const Home = () => {

  const accordianData = [
    {
      title: "Faster deployment",
      content: "Upload without testing."
    },
    {
      title: "Free tier",
      content: "Get started with no upfront cost"
    },
    {
      title: "Developer community",
      content: "Connect with other developers with similar interest"
    }, 
    {
      title: "Generous premium package",
      content: `With our one time payment you can post unlimited apps and remove ads from the broswer.`
    }
  ]

  return (
    <div className='home_container'>

      <div className="home_hero">
        <div className="home_left">
          <h1>Become a developer today</h1>
          <Link to='auth/register'>Get started for free</Link>
        </div>

        <div className="home_right">
          <img src={Developer} alt="Developer" />
        </div>
      </div>

      <div className="home_info">
      
        <div className="home_info_inner_section">
          <div>
            <h3>What is <span>Appja</span>?</h3>
            <p>
              Appja is theee platform for android developers to host 
              and showcase their portfolio projects. With this plaform, users 
              can register as a developer and upload apps for other developers, 
              regular views and potential employers to see.
            </p>
          </div>

          <div>
            <img src={Mobile} alt="mobile image" />
          </div>

        </div>
        
      </div>

      <div className="home_why_container">
        <div className='img'>
          <img src={Person} alt="computer" />
        </div>
        <div className='accordian_list'>
            <h3>Why use this <span>Platform</span>?</h3>

            {
              accordianData.map((data, i) => <Accordian key={i} title={data.title} content={data.content}/>)
            }
        </div>
      </div>

      <div className="home_see_price_container">
        <Link to="/pricing">See Pricing</Link>
      </div>


    </div>
  )
}

export default Home