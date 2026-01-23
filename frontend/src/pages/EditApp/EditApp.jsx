import { useEffect, useState } from 'react'
import { useParams, useNavigate } from "react-router-dom";
import useAxios from "../../utils/useAxios";
import { CircleLoader } from 'react-spinners';
import { toast } from 'react-toastify';
// import { createClient } from "@supabase/supabase-js"; // Removed
import { generateRandomName } from "../../utils/generateRandomName";

// const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY); // Removed


const EditApp = () => {

    const { appId } = useParams();
    const api = useAxios();
    const [data, setData] = useState(null);
    const [media, setMedia] = useState([]);
    const [icon, setIcon] = useState(null);
    const [apk, setApk] = useState(null);
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const navigate = useNavigate();

    //Updated state
    const [updatedIcon, setUpdatedIcon] = useState(null);
    const [newImages, setNewImages] = useState([]);
    const [deletedImages, setDeletedImages] = useState([]);

    const getAppDetails = async () => {
        try {
            const response = await api.get(`app/${appId}`);

            setData(response.data);
            setMedia(response.data.media);
            setDescription(response.data.app.app_description);
            setIcon(response.data.app.app_icon_url);
            setApk(response.data.app.app_url);


            console.log(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const removeMedia = (index) => {
        setDeletedImages([...deletedImages, ...media.slice(index, index + 1)])

        const newArr = media.filter((val, i) => i !== index);
        setMedia(newArr);

        // Also remove from newImages if it was a new image (optional/complex correlation, skipping for now as it doesn't hurt)
    }

    const mediaFilesHandler = (e) => {

        if (e.target.files.length < 1) {
            return;
        };

        const files = Array.from(e.target.files);
        const allowedNumber = 4 - media.length;

        if (files.length <= allowedNumber) {
            setNewImages(prev => [...prev, ...files]);

            const newTempImages = files.map(file => ({ image_url: URL.createObjectURL(file) }));
            setMedia([...media, ...newTempImages]);
        } else {
            // If selected more than allowed, take only what fits
            const filesToTake = files.slice(0, allowedNumber);
            setNewImages(prev => [...prev, ...filesToTake]);

            const newTempImages = filesToTake.map(file => ({ image_url: URL.createObjectURL(file) }));
            setMedia([...media, ...newTempImages]);

            toast.info(`You could only select ${allowedNumber} more media ${allowedNumber < 2 ? "file" : "files"}.`)
        }
    }

    const updateIconHandler = (e) => {

        if (e.target.files && e.target.files[0]) {
            setUpdatedIcon({
                "data": e.target.files[0],
                "localFile": URL.createObjectURL(e.target.files[0])
            });
        }
    }

    const deleteAppHandler = async () => {
        try {
            setUpdating(true);

            // Just call the API, backend should handle file deletion if possible or we leave it for cleanup job
            const response = await api.delete(`${import.meta.env.VITE_BASE_SERVER_URL}/app/remove/${appId}`);

            toast.info(response.data.message);

            navigate("/profile", { replace: true })
        } catch (error) {
            console.log(error);
            toast.error("Error deleting app");
        } finally {
            setUpdating(false);
        }
    }

    const formHandler = async (e) => {
        try {
            e.preventDefault();
            setUpdating(true);

            const formData = new FormData();
            formData.append("app_name", data.app.app_name); // Assuming name isn't editable here, or pass if it is
            formData.append("description", description);

            // Handle Icon update
            if (updatedIcon) {
                formData.append("icon", updatedIcon.data);
            }

            // Handle APK update
            if (typeof (apk) != "string") {
                formData.append("app", apk);
            }

            // Handle Deleted Images (pass as JSON string)
            if (deletedImages && deletedImages.length > 0) {
                formData.append("deletedImages", JSON.stringify(deletedImages));
            }

            // Handle New Images
            if (newImages && newImages.length > 0) {
                // newImages is Array
                for (let i = 0; i < newImages.length; i++) {
                    formData.append("images", newImages[i]);
                }
            }

            const response = await api.put(
                `app/${appId}`,
                formData
            );

            toast.info(response.data.message);

            // Refresh data
            getAppDetails();
            setUpdatedIcon(null);
            setNewImages([]);
            setDeletedImages([]);


        } catch (error) {

            console.log(error);

        } finally {
            setUpdating(false);
        }

    }


    useEffect(() => {
        getAppDetails();
    }, [loading])

    if (loading) {
        return <center>Loading</center>
    }

    return (
        <main className='w-full h-full flex flex-col items-center mt-10'>

            <form className='w-3/5 flex flex-col items-center max-md:w-full' onSubmit={formHandler}>
                <div className='w-full mb-14'>
                    <div className='p-3 mb-8 w-full bg-black flex justify-between items-center'>
                        <h1 className='text-xl'>Description</h1>
                    </div>
                    <textarea type="text" placeholder="Description" onChange={(e) => setDescription(e.target.value)} value={description} className='bg-transparent h-[150px] w-full p-3 resize-none border-[1px] border-gray-300 transition duration-300 rounded-xl focus:border-purple-500 outline-none'></textarea>
                </div>

                <div className='w-full mb-14'>
                    <div className='p-3 mb-8 w-full bg-black flex justify-between items-center'>
                        <h1 className='text-xl'>Icon</h1>
                        <label htmlFor='changeicon' className='text-blue-400 hover:cursor-pointer'>Change &gt;&gt;</label>
                        <input id="changeicon" type="file" hidden={true} onChange={updateIconHandler} />
                    </div>

                    <img src={updatedIcon == null ? icon : updatedIcon.localFile} alt="" className='h-80 w-2/5 object-contain m-auto max-md:w-full' />
                </div>

                <div className='w-full mb-14'>
                    <div className='p-3 w-full bg-black flex justify-between items-center mb-8'>
                        <h1 className='text-xl'>Media files</h1>
                        {media.length < 4 && <label htmlFor='changemedia' className='text-blue-400 hover:cursor-pointer'>Add &gt;&gt;</label>}
                        <input id="changemedia" type="file" hidden={true} multiple={true} onChange={mediaFilesHandler} />
                    </div>

                    <div className='grid grid-cols-2 gap-5 max-md:flex max-md:flex-wrap max-md:justify-center'>
                        {media.map((image, index) => (
                            <div key={index} className='border-[1px] border-purple-500 rounded-lg p-2'>
                                <button type="button" className='text-red-400 text-xl' onClick={() => removeMedia(index)}>Remove</button>
                                <img src={image.image_url} className='h-80 w-full object-contain' />
                            </div>

                        ))}
                    </div>
                </div>

                <div className='w-full'>
                    <div className='p-3 w-full bg-black flex justify-between items-center mb-8'>
                        <h1 className='text-xl'>APK File</h1>
                        <label htmlFor='changeapk' className='text-blue-400 hover:cursor-pointer'>Update &gt;&gt;</label>
                        <input id="changeapk" type="file" hidden={true} accept=".apk" onChange={(e) => setApk(e.target.files[0])} />
                    </div>

                    {apk ? <h1 className='text-green-600 text-lg'>APK Set</h1> : <h1 className='text-red-500 text-lg'>Please select APK</h1>}
                </div>

                {updating ? <CircleLoader size={60} color="#cf70db" className='m-auto overflow-y-hidden' /> : <button type="submit" disabled={updating} className='h-[60px] w-full mt-10 bg-purple-500 border-none outline-none cursor-pointer transition duration-300 hover:bg-purple-600'>Update</button>}
                {updating ? <CircleLoader size={60} color="#cf70db" className='m-auto overflow-y-hidden' /> : <button type="button" disabled={updating} onClick={deleteAppHandler} className='h-[60px] w-full mt-10 bg-red-500 border-none outline-none cursor-pointer transition duration-300 hover:bg-red-600'>Delete</button>}

            </form>

        </main>
    )
}

export default EditApp