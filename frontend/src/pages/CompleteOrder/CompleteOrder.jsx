import { Link } from 'react-router-dom'


const CompleteOrder = () => {
  return (
    <div>
        <center>
            <h1 className='text-green-400 text-3xl mb-10'>Order Successful</h1>
            <Link to="/profile" className='text-blue-400'>Go to Profile</Link>
        </center>
    </div>
  )
}

export default CompleteOrder