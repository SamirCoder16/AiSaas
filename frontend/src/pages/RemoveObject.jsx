import { Download, Loader, Scissors, Sparkles } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveObject = () => {
  const [input, setInput] = useState("");
  const [object, setObject] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken } = useAuth();

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      if (object.split(" ").length > 1) {
        return toast.error("Please enter a single object name.");
      }

      const formData = new FormData();
      formData.append("image", input);
      formData.append("object", object);

      const { data } = await axios.post(
        "/api/ai/remove-image-object",
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
      console.error(error);
      toast.error(
        error.message || "An error occurred while processing your request."
      );
    } finally {
      setLoading(false);
    }

    setInput("");
    setObject("");
  };

  const downloadImage = async () => {
    if (!content) return;

    try {
      const response = await fetch(content);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `remove-background-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to download image.");
    } finally {
      toast.success("Image downloaded successfully!");
    }
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* Left col */}
      <form
        onSubmit={handleFormSubmit}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#4A7AFF]" />
          <h1 className="text-xl font-semibold">Object Removal</h1>
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

        {/* Text area */}

        <p className="mt-6 text-sm font-medium">
          Describe object name to remove.
        </p>
        <textarea
          type="text"
          rows={4}
          required
          value={object}
          onChange={(e) => setObject(e.target.value)}
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
          placeholder="e.g., watch or spoon , Only single object name"
        />
        <p className="mt-2 text-xs text-gray-500">
          Be specific about what you want to remove.
        </p>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#417DF6] to-[#8E37EB] text-white px-4 py-2 mt-6 text-sm rounded-lg  ${
            loading
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer active:scale-95"
          }`}
        >
          {loading ? (
            <>
              <Loader className="w-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              {" "}
              <Scissors className="w-5" /> <span>Remove object</span>
            </>
          )}
        </button>
      </form>

      {/* Right col */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px] ">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scissors className="w-5 h-5 text-[#4A7AFF]" />
            <h1 className="text-xl font-semibold">Processed Image</h1>
          </div>

          {content && (
            <button
              onClick={downloadImage}
              className="flex items-center cursor-pointer active:scale-95 gap-2 bg-gradient-to-r from-[#417DF6] to-[#8E37EB] text-white px-3 py-1 rounded-lg text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          )}
        </div>

        <div className="flex-1 flex justify-center items-center">
          {loading ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-4">
              {/* Image skeleton */}
              <div className="w-full max-w-sm h-64 bg-gray-200 rounded-lg animate-pulse"></div>
              {/* Text skeleton */}
              <div className="flex flex-col items-center gap-2">
                <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
            </div>
          ) : content ? (
            <div className="w-full h-full flex justify-center items-center p-4">
              <img
                src={content}
                alt="Processed"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          ) : (
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <Scissors className="w-9 h-9" />
              <p>Upload an image and describe what to remove.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemoveObject;
