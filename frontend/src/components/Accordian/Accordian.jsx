import { useState } from 'react'
import './accordian.css'

const Accordian = ({title, content }) => {

    const [isActive, setActive] = useState(false);

  return (
    <div className="accordian_card" >
        <div className="accordian_head" onClick={() => setActive((prev) => !prev)}>
            <div className="title">
                <h6>{title}</h6>
            </div>
            <div className="expand_btn">
                <h6>{isActive ? '-' : '+'}</h6>
            </div>
        </div>

        <p className={isActive ? "content show" : "content"}>{ content }</p>
        
    </div>
  )
}

export default Accordian