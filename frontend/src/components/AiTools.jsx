import { useNavigate } from "react-router-dom";
import { AiToolsData, assets } from "../assets/assets";
import { useUser } from "@clerk/clerk-react";

const AiTools = () => {

    const navigate = useNavigate();
    const { user } = useUser();
    

  return (
    <div className="px-4 sm:px-20 xl:px-32 my-24">
      <div className="text-center">
        <h2 className="text-slate-700 text-[42px] font-semibold">
          Powerful AI tools
        </h2>
        <p className="text-gray-500 max-w-lg mx-auto">
          Everything you need to create, enhance, and optimize your content with
          cutting-edge AI technology
        </p>
      </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {AiToolsData.map((tool, idx) => (
          <div
            onClick={() => user && navigate(tool.path)}
            key={idx}
            className="p-8 max-w-xs mx-auto rounded-lg bg-[#FDFDFE] shadow-lg border border-gray-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            <tool.Icon className="w-12 h-12 p-3 text-white rounded-xl" style={{ background: `linear-gradient(to bottom, ${tool.bg.from}, ${tool.bg.to})`}} />
            <h3 className="mt-6 mb-3 text-lg font-semibold">{tool.title}</h3>
            <p className="text-gray-400 text-sm">{tool.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AiTools;
