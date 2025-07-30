import { Download, Eraser, Loader, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveBackground = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken } = useAuth();

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Handle form submission logic here
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", input);

      const { data } = await axios.post(
        "/api/ai/remove-image-background",
        formData,
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );

      if (data.success) {
        setContent(data.content);
        toast.success("Boooyah!");
      } else {
        toast.error("Something went wrong!");
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message || "An error occurred while processing your request.");
    } finally {
      setLoading(false);
    }

    // Reset form fields
    setInput("");
  };


  const downloadImage = async () => {
    if(!content) return;

    try {
      const response = await fetch(content);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `remove-background-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      toast.error("Failed to download image.");
    }finally{
      toast.success("Image downloaded successfully!");
    }
  }

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* Left col */}
      <form
        onSubmit={handleFormSubmit}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#FF4938]" />
          <h1 className="text-xl font-semibold">Background Removal</h1>
        </div>
        <p className="mt-6 text-sm font-medium">Upload Image</p>
        <input
          type="file"
          required
          onChange={(e) => setInput(e.target.files[0])}
          accept="image/*"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600"
        />

        <p className="text-xs text-gray-500 font-light mt-1">
          Supports JPG, PNG, and others image formats
        </p>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#F6AB41] to-[#FF4938] text-white px-4 py-2 mt-6 text-sm rounded-lg ${
            loading
              ? "opacity-50 cursor-not-allowed"
              : "active:scale-95 cursor-pointer"
          }`}
        >
          {loading ? (
            <>
              <Loader className="animate-spin w-5" /> <span>Processing...</span>{" "}
            </>
          ) : (
            <>
              <Eraser className="w-5" /> <span>Remove Background</span>
            </>
          )}
        </button>
      </form>

      {/* Right col */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px] ">
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Eraser className="w-5 h-5 text-[#FF4938]" />
          <h1 className="text-xl font-semibold">Processed Image</h1>
        </div>
        {
          content && (
            <button 
            onClick={downloadImage}
            className="flex items-center cursor-pointer active:scale-95 gap-2 bg-gradient-to-r from-[#F6AB41] to-[#FF4938] text-white px-3 py-1 rounded-lg text-sm transition-colors"
            >
              <Download  className="w-4 h-4"/>
              Download
            </button>
          )
        }
        </div>

        <div className="flex-1 flex justify-center items-center">
          {loading ? (
            // Skeleton Loader
            <div className="w-full h-full flex justify-center items-center animate-pulse">
              <div className="w-64 h-64 bg-gray-200 rounded-lg flex flex-col justify-center items-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full mb-4"></div>
                <div className="w-24 h-3 bg-gray-300 rounded mb-2"></div>
                <div className="w-16 h-2 bg-gray-300 rounded"></div>
              </div>
            </div>
          ) : content ? (
            // Processed Image
            <div className="w-full h-full flex justify-center items-center">
              <img
                src={content}
                alt="Processed"
                className="max-w-full max-h-full object-contain rounded"
              />
            </div>
          ) : (
            // Default state
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <Eraser className="w-9 h-9" />
              <p>
                Upload an image and click "Remove Background" to get started.
              </p>
            </div> 
          )}
        </div>
      </div>
    </div>
  );
};

export default RemoveBackground;
