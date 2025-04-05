import { useEffect, useState } from "react";
import useAxios from "../../utils/useAxios";
import AppCard from "../../components/AppCard/AppCard";

const Explore = () => {
  const api = useAxios();
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState([]);
  const [search, setSearch] = useState("");
  const [searchParameter, setSearchParameter] = useState("App");
  const [completeList, setCompleteList] = useState([]);;


  const getApps = async () => {

    try {
      const response = await api.get("app");

      setApps(response.data.apps);
      setCompleteList(response.data.apps);

    } catch(error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const searchHandler = (e) => {
    setSearch(e.target.value);

    setApps(apps.filter(app => searchParameter == "App" ? app.app_name.toLowerCase().includes(e.target.value.toLowerCase()) : app.username.toLowerCase().includes(e.target.value.toLowerCase())));

    if (e.target.value == "") {
      setApps(completeList);
    }
  }

  useEffect(() => {
    getApps();
  }, [])

  if (loading) {
    return <center>Loading</center>
  }

  return (
    <main className="mt-10"> 
      <center className="mb-16 max-md:flex max-md:flex-col max-md:gap-4 max-md:items-center">
        <input type="text" value={search} onChange={searchHandler} className="w-2/3 max-md:w-11/12 h-10 border-[1px] border-gray-400 rounded-xl outline-none focus:border-purple-500 bg-transparent ps-2 py-6 mr-8 max-md:mr-0" placeholder={searchParameter == "Developer" ? "Search by username ..." : "Search..."}/>
        <select onChange={(e) => setSearchParameter(e.target.value)} value={searchParameter} className="h-12 w-32 p-3 border-[1px] border-gray-400 bg-[#241f25] outline-none">
          <option value="App">App</option>
          <option value="Developer">Developer</option>
        </select>
      </center>

      <div className="w-full flex gap-3 flex-wrap max-md:justify-center">
        {apps.length < 1 ? <h1 className='text-2xl text-center'>{searchParameter == "App" ? "No apps" : "No developer by that username"}</h1> : apps.map((app, i) => <AppCard key={i} app={app} developerId={app.developer_id} />)}
      </div>
      
    </main>
  )
}

export default Explore;