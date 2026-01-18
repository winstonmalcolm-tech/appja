import { useEffect, useState } from 'react'
import useAxios from '../../utils/useAxios';
import { toast } from 'react-toastify';
import { CircleLoader } from 'react-spinners';
import { generateRandomName } from "../../utils/generateRandomName";
// import { createClient } from '@supabase/supabase-js'; // Removed

// const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY); // Removed


const EditProfile = () => {

    const api = useAxios();
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [profileImg, setProfileImg] = useState(null);
    const [username, setUsername] = useState("");
    const [instagram, setInstagram] = useState("");
    const [linkedIn, setLinkedIn] = useState("");
    const [github, setGithub] = useState("");
    const [website, setWebsite] = useState("");
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [localFile, setLocalFile] = useState(null);


    const onImageChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            setLocalFile({
                "data": event.target.files[0],
                "localFile": URL.createObjectURL(event.target.files[0])
            });
        }
    }

    const submitHandler = async (e) => {

        try {
            setIsUpdating(true);
            e.preventDefault();

            const socials = [
                { name: "Instagram", url: instagram },
                { name: "LinkedIn", url: linkedIn },
                { name: "Website", url: website },
                { name: "Github", url: github }
            ];

            const formData = new FormData();
            formData.append("email", email);
            formData.append("firstName", firstName);
            formData.append("lastName", lastName);
            formData.append("username", username);
            formData.append("socials", JSON.stringify(socials));

            if (localFile) {
                formData.append("profile_image", localFile.data);
            }

            const response = await api.put("developer/update", formData);

            toast.success(response.data.message);

        } catch (error) {
            toast.error("There is some error, please try back later");
            console.log(error);
        } finally {
            setIsUpdating(false);
        }
    }

    const getData = async () => {

        try {
            const response = await api.get("developer");
            console.log(response.data);
            setEmail(response.data.user.email);
            setFirstName(response.data.user.first_name);
            setLastName(response.data.user.last_name);
            if (response.data.user.profile_image) {
                setProfileImg(response.data.user.profile_image);
            }
            setUsername(response.data.user.username);

            for (let social of response.data.socials) {
                switch (social.social_name) {
                    case "Instagram":
                        setInstagram(social.social_url);
                        break;

                    case "Github":
                        setGithub(social.social_url);
                        break;

                    case "Website":
                        setWebsite(social.social_url);
                        break;

                    case "LinkedIn":
                        setLinkedIn(social.social_url);
                        break;
                }
            }


        } catch (error) {
            console.log(error);
            toast.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getData()
    }, []);

    if (loading) {
        return <center>Loading</center>
    }

    return (
        <div className='w-full flex justify-center mt-20 max-md:mt-10'>
            <form onSubmit={submitHandler} method="post" className='flex flex-col gap-5 items-center w-full'>
                <h1 className='overflow-hidden text-4xl'>Modify</h1>

                <div className='relative px-20'>
                    <div className='relative h-52 w-52 flex justify-center items-start bg-gradient-to-r from-custom-purple to-off-purple rounded-full'>
                        {(!profileImg && !localFile) ? <h1 className='flex items-center justify-center h-full w-full text-6xl'>{firstName.charAt(0).toUpperCase()}{lastName.charAt(0).toUpperCase()}</h1> : <img className="w-full h-full object-cover object-top rounded-full" src={localFile ? localFile.localFile : profileImg} />}
                    </div>
                    <label htmlFor="image" className='absolute top-3/4 left-[250px] bg-blue-400 p-2 rounded-lg hover:cursor-pointer'>Select</label>
                    <input type="file" id="image" hidden={true} onChange={onImageChange} accept="image/*" />
                </div>

                <input type="text" className="w-3/5 max-md:w-full h-14 rounded-xl bg-transparent border-2 border-gray-500 focus:border-purple-400 outline-none ps-3" onChange={(e) => setEmail(e.target.value)} value={email} placeholder='Email..' />
                <input type="text" className="w-3/5 max-md:w-full h-14 rounded-xl bg-transparent border-2 border-gray-500 focus:border-purple-400 outline-none ps-3" onChange={(e) => setFirstName(e.target.value)} value={firstName} placeholder='First name' />
                <input type="text" className="w-3/5 max-md:w-full h-14 rounded-xl bg-transparent border-2 border-gray-500 focus:border-purple-400 outline-none ps-3" onChange={(e) => setLastName(e.target.value)} value={lastName} placeholder='Last name' />
                <input type="text" className="w-3/5 max-md:w-full h-14 rounded-xl bg-transparent border-2 border-gray-500 focus:border-purple-400 outline-none ps-3" onChange={(e) => setUsername(e.target.value)} value={username} placeholder='Username' />
                <input type="text" className="w-3/5 max-md:w-full h-14 rounded-xl bg-transparent border-2 border-gray-500 focus:border-purple-400 outline-none ps-3" onChange={(e) => setGithub(e.target.value)} value={github} placeholder='Github' />
                <input type="text" className="w-3/5 max-md:w-full h-14 rounded-xl bg-transparent border-2 border-gray-500 focus:border-purple-400 outline-none ps-3" onChange={(e) => setWebsite(e.target.value)} value={website} placeholder='Website' />
                <input type="text" className="w-3/5 max-md:w-full h-14 rounded-xl bg-transparent border-2 border-gray-500 focus:border-purple-400 outline-none ps-3" onChange={(e) => setInstagram(e.target.value)} value={instagram} placeholder='Instagram' />
                <input type="text" className="w-3/5 max-md:w-full h-14 rounded-xl bg-transparent border-2 border-gray-500 focus:border-purple-400 outline-none ps-3" onChange={(e) => setLinkedIn(e.target.value)} value={linkedIn} placeholder='LinkedIn' />

                {isUpdating ? <CircleLoader size={60} color="#cf70db" className='signup_load_icon' /> : <button type="submit" className='h-14 w-2/5 bg-purple-600 border-none text-white outline-none cursor-pointer transition duration-300 hover:bg-purple-500 rounded-lg'>Update</button>}
            </form>
        </div>
    )
}


export default EditProfile

//<h1 className='flex justify-center items-center h-full w-full text-6xl'>{firstName.charAt(0).toUpperCase()}{lastName.charAt(0).toUpperCase()}</h1> 