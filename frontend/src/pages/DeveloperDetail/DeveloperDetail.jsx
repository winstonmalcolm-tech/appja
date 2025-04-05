import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from "react-toastify";
import useAxios from '../../utils/useAxios';
import AppCard from '../../components/AppCard/AppCard';

const DeveloperDetail = () => {

    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const api = useAxios();

    const fetchUserData = async () => {

      try {

        const response = await api.get(`/developer/${id}`);
        console.log(response.data);
        setData(response.data);
    
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }

    useEffect(() => {
      fetchUserData()
    }, []);

    if (loading) {
      return <center>Loading</center>
    }

  return (
    <main className='w-full h-full'>
      <div className='flex max-md:flex-col'>
        <div className='flex-1 w-full h-52 flex gap-5 mt-11 max-md:flex-none max-md:flex-col max-md:h-fit max-md:items-center'>
          {/* Image container */}
          <div className='h-52 w-52 flex justify-center items-start bg-gradient-to-r from-custom-purple to-off-purple rounded-full'>
            {!data.user.profile_image ? <h1 className='flex justify-center items-center h-full w-full text-6xl'>{data.user.first_name.charAt(0).toUpperCase()}{data.user.last_name.charAt(0).toUpperCase()}</h1> : <img className='w-full h-full object-cover object-top rounded-full' src={data.user.profile_image}/>}
          </div>

          <div className='flex flex-col h-full justify-center'>
            <h1 className='text-3xl'>{data.user.first_name} {data.user.last_name}</h1>
            <h4 className='text-gray-300 mb-10'>@{data.user.username}</h4>

            <button className="p-2 border-2 bg-transparent rounded-xl text-center max-md:mb-9" onClick={()=>document.getElementById('my_modal_1').showModal()}>Socials</button>
            <dialog id="my_modal_1" className="modal">
              <div className="modal-box">
                <h3 className="font-bold text-lg mb-5">Socials</h3>
                
                <dl>
                  {data.socials.map((social, i) => {
                    if (social.social_url != "") {
                      return (
                        <>
                          <dt>{social.social_name}</dt>
                          <dd>{social.social_url}</dd>
                        </>
                      )
                    }
                  })}
                </dl>
                
                <div className="modal-action">
                  <form method="dialog">
                    {/* if there is a button in form, it will close the modal */}
                    <button className="btn">Close</button>
                  </form>
                </div>
              </div>
            </dialog>
          </div>
        </div>

        <div className='flex-1 flex w-full justify-center items-center'>
          <h1 className='text-2xl'>{data.apps.length} {data.apps.length > 1 ? "apps" : "app"} published</h1>
        </div>
      </div>

      <div className='mt-32 flex flex-wrap gap-8 justify-center'>
        {data.apps.length < 1 ? <h1 className='text-2xl'>No apps</h1> : data.apps.map((app, i) => <AppCard key={i} app={app} developerId={app.developer_id} />)}
      </div>
    </main>
  )
}

export default DeveloperDetail