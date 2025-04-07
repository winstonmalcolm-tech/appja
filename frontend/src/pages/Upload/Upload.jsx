import "./upload.css";
import { Link } from "react-router-dom";
import { IoReturnDownBack } from "react-icons/io5";
import { useState } from "react";
import { toast } from "react-toastify";
import useAxios from "../../utils/useAxios";
import { useNavigate } from "react-router-dom";
import { CircleLoader } from 'react-spinners';
import { IoIosHelpCircle } from "react-icons/io";
import {createClient} from "@supabase/supabase-js";
import { generateRandomName } from "../../utils/generateRandomName";
import { byteToMegabyte } from "../../utils/byteToMegabyte";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

const Upload = () => {

    const api = useAxios();
    const [appName, setAppName] = useState("");
    const [category, setCategory] = useState("Please select one category");
    const [description, setDescription] = useState("");
    const [icon, setIcon] = useState(null);
    const [images, setImages] = useState(null);
    const [app, setApp] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const navigate = useNavigate();

    const formHandler = async (e) => {

        try {

            e.preventDefault();

            if (!appName || !description || !category) {
                toast.info("Please fill all fields");
                return;
            }

            if (!icon) {
                toast.info("Please select an icon");
                return;
            }

            if (!images || images?.length < 1) {
                toast.info("Please select at least 1 image");
                return;
            }

            if (!app) {
                toast.info("Please select the apk file for your app");
                return;
            }

            if (images.length > 4) {
                toast.info("Only the first 4 images will be uploaded");
            }

            const apkSize = byteToMegabyte(app.size);
            if (apkSize > 49.5) {
                toast.info("App size should not be greater than 50MB.");
                return;
            }

            setLoading(true);

            let {data, error} = await supabase.storage.from("test").upload(`apps/${generateRandomName()}`, app, {cacheControl: '3600', upsert: false});

            if (error) {
                throw new Error(error.message);
            }
            
            const appId = data.id;
            const appUrl = `https://usmrhsyttzziphqltrdn.supabase.co/storage/v1/object/public/${data.fullPath}`;

            ({data, error} = await supabase.storage.from("test").upload(`media/${generateRandomName()}`, icon, {cacheControl: '3600', upsert: false}));

            if (error) {
                throw new Error(error.message);
            }

            const iconUrl = `https://usmrhsyttzziphqltrdn.supabase.co/storage/v1/object/public/${data.fullPath}`
            

            const imagesTemp = [];

            for (let i = 0; i < images.length; i++) {
                ({data, error} = await supabase.storage.from("test").upload(`media/${generateRandomName()}`, images[i], {cacheControl: '3600', upsert: false}));

                if (error) {
                    throw new Error(error.message);
                }

                let imageUrl = `https://usmrhsyttzziphqltrdn.supabase.co/storage/v1/object/public/${data.fullPath}`
                imagesTemp.push({imageUrl, id: data.id});
            }

            const response = await api.post("app/upload", {
                "app_name": appName,
                "app_category": category,
                "app_description": description,
                "app_url": appUrl,
                "icon_url": iconUrl,
                "app_size": app.size,
                "supabase_app_id": appId,
                "imagesArr": JSON.stringify(imagesTemp)
            });

            toast.success(response.data.message);
            navigate(-1);
        
    
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }


    }

    const appCategories = [
        "Android Wear",
        "Art & Design",
        "Auto & vehicles",
        "Beauty",
        "Books & Reference",
        "Business",
        "Comics",
        "Communication",
        "Dating",
        "Entertainment",
        "Education",
        "Events",
        "Finance",
        "Food & Drink",
        "Health & Fitness",
        "House & Home",
        "Lifestyle",
        "Maps & Navigation",
        "Medical",
        "Music & Audio",
        "News & Magazines",
        "Parenting",
        "Personalization",
        "Photography",
        "Productivity",
        "Shopping",
        "Social",
        "Sports",
        "Tools",
        "Travel & Local",
        "Video Players & Editors",
        "Weather",
        "Family",
        "Game"
    ]

  return (
    <div className='upload_container'>
        
        <div className="upload_return_container">
            <Link to={'/profile'}><IoReturnDownBack size={25} color="red"/>Return</Link>
            <IoIosHelpCircle size={30} color="white" className="help_btn" onClick={()=>document.getElementById('help_modal').showModal()}/>
        
            <dialog id="help_modal" className="modal">
              <div className="modal-box">
                <h1 className="font-bold text-2xl mb-5">How to get APK file for:</h1>
                
                <section className="mb-8">
                    <h2 className="text-xl mb-5">React Native Projects</h2>

                    <ol className="flex flex-col gap-3">
                        <li className="text-gray-400">1. Open a terminal and navigate to the project directory </li>
                        <li className="text-gray-400">2. Run the command `cd android`</li>
                        <li className="text-gray-400">3. Run the command `./gradlew assembleRelease` to generate a release APK </li>
                        <li className="text-gray-400">4. Find the APK file in the following path: `android/app/build/outputs/apk/release/app-release.apk`</li>
                    </ol>

                </section>
                <section className="mb-8">
                    <h2 className="text-xl mb-5">Flutter Projects</h2>

                    <ol className="flex flex-col gap-3">
                        <li className="text-gray-400">1. Open the Flutter project in the terminal.</li>
                        <li className="text-gray-400">2. Run the command `flutter build apk`</li>
                        <li className="text-gray-400">3. Locate the generated APK file in the `build/app/outputs/flutter-apk` directory</li>
                    </ol>

                </section>
                <section className="mb-8">
                    <h2 className="text-xl mb-5">Native Projects</h2>

                    <ol className="flex flex-col gap-3">
                        <li className="text-gray-400">1. Open the Build option in the toolbar.</li>
                        <li className="text-gray-400">2. Click the `Generate Signed Bundle` option</li>
                        <li className="text-gray-400">3. Select APK and follow the rest of the steps</li>
                    </ol>
                </section>
                
                
                <div className="modal-action">
                  <form method="dialog">
                    {/* if there is a button in form, it will close the modal */}
                    <button className="btn">Close</button>
                  </form>
                </div>
              </div>
            </dialog>
        </div>

        <div className="upload_form_container">
            <form onSubmit={formHandler} method="post">
                <input type="text" placeholder="App Name" value={appName} onChange={(e) => setAppName(e.target.value)}/>
                <select onChange={(e) => setCategory(e.target.value)} value={category}>
                    <option disabled>Please select one category</option>
                    {appCategories.map((item, i) => { 
                        return (
                        <option key={i} value={item}>{item}</option>
                        )
                    })}
                    
                </select>
                <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>

                <label htmlFor="app_icon">Select an Icon</label>
                <input type="file" id="app_icon" hidden accept="image/png, image/jpeg" onChange={(e) => setIcon(e.target.files[0])}/>

                <p>{icon?.name}</p>

                <label htmlFor="app_showcase_images">Select 4 images for showcase</label>
                <input type="file" id="app_showcase_images" hidden accept="image/png, image/jpeg" multiple={true} onChange={(e) => setImages(e.target.files)} max={4}/>
                
                <p>{images && "Images selected"}</p>
            
                <label htmlFor="app_apk">Apk file</label>
                <input type="file" id="app_apk" hidden accept=".apk" onChange={(e) => setApp(e.target.files[0])}/>

                <p>{app?.name}</p>
                
                { isLoading ? <CircleLoader size={60} color="#cf70db" className='overflow-hidden'/>: <button type="submit">Upload</button>}
               
            </form>
        </div>
    </div>
  )
}

export default Upload