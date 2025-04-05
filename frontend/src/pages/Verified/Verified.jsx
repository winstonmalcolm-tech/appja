import { useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from "react-router-dom";

const Verified = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const isVerified = searchParams.get("isVerified");
    const reason = searchParams.has("reason") ? searchParams.get("reason") : "";

    

    useEffect(() => {
        if (isVerified == null) {
            navigate("/", {replace: true});
            return;
        }
    }, []);

  return (
    <main className='h-dvh'>
        <div className='flex items-center flex-col'>
            {isVerified == "true" ? <h1 className='text-green-400 text-4xl p-10'>Email verified</h1> : <h1 className='text-red-400 text-3xl p-10 max-md:text-2xl'>Email not verified - {reason}</h1>}
            {isVerified == "true" ? <Link to={"/auth/login"} className='text-xl'>Go to login</Link> : <Link to={"/"} className='text-xl'>Go home</Link>}
        </div>
    </main>
  )
}

export default Verified