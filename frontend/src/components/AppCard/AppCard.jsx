import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { TokenContext } from "../../contexts/tokenContextProvider";
import { useContext } from "react";

const AppCard = ({app, developerId}) => {
  
  const { tokens } = useContext(TokenContext);

  const isOwnerApp = tokens ? jwtDecode(tokens.accessToken).id == developerId : false;

  return (
    <div className="w-80  border-2 rounded-lg border-purple-500">
      <div className="h-1/2 w-full">
        <img src={app.app_icon_url} alt="" className="object-cover w-full h-full"/>
      </div>
      <div className="mt-2 flex flex-col gap-3 px-3">
        <h1 className="text-xl">{app.app_name}</h1>
        <div className="flex justify-between">

          <h3 className="text-gray-300">{app.app_category}</h3>
          <h3 className="text-gray-300">Size: {app.app_size}MB</h3>
        </div>
        <h3 className="text-gray-300">{app.number_of_downloads} Downloads</h3>
        
        <div className="flex justify-between">

          <Link to={`/apps/${app.app_id}`} className="bg-purple-600 p-2 w-fit">View more &gt;&gt;</Link>

          { isOwnerApp && <Link to={`/apps/edit/${app.app_id}`} className="text-blue-400 p-2 w-fit">Edit &gt;&gt;</Link> }
        </div>

      </div>
    </div>
  )
}

export default AppCard