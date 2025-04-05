import { useEffect, useContext, useState } from 'react'
import PriceCard from '../../components/PriceCard/PriceCard';
import useAxios from '../../utils/useAxios';
import { TokenContext } from '../../contexts/tokenContextProvider';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

const Purchase = () => {

  const api = useAxios();
  const {tokens} = useContext(TokenContext);
  const [currentPlan, setCurrentPlan] = useState('');
  const [loading, setLoading] = useState(true);

  const plans = [
    {
        temp: "Standard",
        plan: "Standard Developer Membership",
        cost: "15.00",
        benefits: [
          "No Ads",
          "10 Apps",
          "200MB storage limit per app"
        ]
    }
  ];

  const getPlan = async () => {
    
    try {
      const id = jwtDecode(tokens.accessToken).id;

      const response = await api.get(`developer/current-plan/${id}`);

      setCurrentPlan(response.data.plan)

    } catch (error) {
      console.log(error);
      toast.error("Please try again later");
    } finally {
      setLoading(false);
    }

  }

  useEffect(() => {
    getPlan();
  }, []);


  if (loading) {
    return <center>Loading</center>
  }

  return (
    <div className='w-full flex justify-center'>
      <PriceCard data={plans[0]} purchase={true} isCurrentPlan={currentPlan == plans[0].temp}/>
    </div>
  )
}

export default Purchase