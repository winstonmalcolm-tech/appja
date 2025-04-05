import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IoMdCheckmark } from "react-icons/io";
import "./pricecard.css";
import useAxios from '../../utils/useAxios';

const PriceCard = ({ data, purchase, isCurrentPlan}) => {
  const [loading, setLoading] = useState(false);
  const api = useAxios();
 
  const purchaseHandler = async (e) => {
    try {
      e.preventDefault();

      setLoading(true);
      const response = await api.post(
        import.meta.env.VITE_BASE_SERVER_URL + "/paypal/pay", 
        {
          "planType": data.plan,
          "cost": data.cost,
          "benefits": data.benefits 
        }
      );

      const url = response.data.url;

      
      location.href = url;

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pricing_card">
        <div className="price_card_type">
          <h1>{data.plan }</h1>
        </div>

        <div className="price_card_charge">
          <h3>${data.cost}</h3>
          <p>/one time payment</p>
        </div>

        <div className="price_card_package">
          <ul>
            {data.benefits.map((benefit, i) => <li key={i}><IoMdCheckmark size={20}/> { benefit }</li>)}
          </ul>

          { purchase == false ? <Link to={"/auth/register"}>Get Started</Link> : (isCurrentPlan == true) ? <h1>Plan Active</h1> : <form onSubmit={purchaseHandler}> <button type='submit' disabled={loading}>{loading ? "Preparing..." : "Purchase"}</button> </form>}
        </div>
    </div>
  )
}

export default PriceCard