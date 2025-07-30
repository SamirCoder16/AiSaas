import { useState } from "react";
import Markdown from "react-markdown";

const CreationItem = ({ item }) => {
    const [expanded, setexpanded] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    return (
        <div onClick={() => setexpanded(!expanded)} className="p-4 max-w-5xl text-sm bg-white border border-gray-200 rounded-lg cursor-pointer">
            <div className="flex justify-between items-center gap-4">
                <div>
                    <h2>{item.prompt}</h2>
                    <p className="text-gray-500">{item.type} - {new Date(item.created_at).toLocaleDateString()}</p>
                </div>
                <button className="bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] px-4 py-1 rounded-full">{item.type}</button>
            </div>
            {
                expanded && (
                    <div>
                        {item.type === "Image" ? (
                            <div className="mt-3">
                                {/* Debug info */}
                                <p className="text-xs text-gray-400 mb-2">Image URL: {item.content}</p>
                                
                                {imageError ? (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded text-red-600">
                                        Image failed to load. Check the URL or file path.
                                    </div>
                                ) : (
                                    <div className="relative">
                                        {!imageLoaded && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
                                                <span className="text-gray-500">Loading image...</span>
                                            </div>
                                        )}
                                        <img 
                                            src={item.content} 
                                            alt="Generated image" 
                                            className={`w-full max-w-md rounded-lg ${!imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity`}
                                            onLoad={() => setImageLoaded(true)}
                                            onError={() => setImageError(true)}
                                        />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="mt-3 h-full overflow-y-scroll text-sm text-slate-700">
                               <div className="reset-tw">
                                 <Markdown>{item.content}</Markdown>
                               </div>
                            </div>
                        )}
                    </div>
                )
            }
        </div>
    )
}

export default CreationItem