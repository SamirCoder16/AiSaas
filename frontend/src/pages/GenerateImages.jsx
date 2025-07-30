import { useState } from "react";
import { Sparkles, Image, Loader, Download } from "lucide-react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const GenerateImages = () => {
  const ImageStyles = [
    "Realistic Style",
    "Ghibli Style",
    "Cartoon Style",
    "Anime Style",
    "Fantasy Style",
    "3D Style",
    "Portrait Style",
  ];

  const [selectedStyle, setselectedStyle] = useState(ImageStyles[0]);
  const [input, setInput] = useState("");
  const [publish, setpublish] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken } = useAuth();

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Handle form submission logic here
    setLoading(true);
    try {
      const prompt = `Generate an image of ${input} in the style of ${selectedStyle}.`;
      const { data } = await axios.post(
        `/api/ai/generate-image`,
        {
          prompt,
          publish,
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );

      if (data.success) {
        setContent(data.imageUrl);
        toast.success("Booyah!");
      } else {
        toast.error(data.message || "Failed to generate image.");
      }
    } catch (error) {
      toast.error(
        "You have exceeded your free usage limit. Please upgrade to premium."
      );
    } finally {
      setLoading(false);
    }

    // Reset form fields
    setInput("");
  };

  // Download function add kariye
  const handleDownload = async () => {
    if (!content) return;

    try {
      const response = await fetch(content);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Image downloaded successfully!");
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Failed to download image.");
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
          <Sparkles className="w-6 text-[#00AD25]" />
          <h1 className="text-xl font-semibold">AI Image Generator</h1>
        </div>
        <p className="mt-6 text-sm font-medium">Describe your image...</p>
        <textarea
          type="text"
          rows={4}
          required
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
          placeholder="Describe what you want to see in the image..."
        />
        <p className="mt-4 text-sm font-medium">Styles</p>

        <div className="mt-3 flex gap-3 flex-wrap sm:max-w-9/11">
          {ImageStyles.map((item, idx) => (
            <span
              key={idx}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${
                selectedStyle === item
                  ? "bg-green-50 text-green-600"
                  : "text-gray-500 border-gray-300"
              }`}
              onClick={() => setselectedStyle(item)}
            >
              {item}
            </span>
          ))}
        </div>

        {/* Publish Image Checkbox */}
        <div className="my-6 flex items-center gap-2">
          <label className="relative cursor-pointer">
            <input
              type="checkbox"
              onChange={(e) => setpublish(e.target.checked)}
              checked={publish}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-300 rounded-full peer-checked:bg-green-500 transition"></div>
            <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-4"></span>
          </label>
          <p className="text-sm font-medium">Make this image Public</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00AD25] to-[#17632e] text-white px-4 py-2 mt-4 text-sm rounded-lg  ${
            loading
              ? "opacity-50 cursor-not-allowed"
              : "active:scale-95 cursor-pointer"
          }`}
        >
          {loading ? (
            <>
              {" "}
              <Loader className="animate-spin w-5" /> <span>Generating...</span>
            </>
          ) : (
            <>
              {" "}
              <Image className="w-5" /> <span>Generate Image</span>
            </>
          )}{" "}
        </button>
      </form>

      {/* Right col */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px] ">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image className="w-5 h-5 text-[#00AD25]" />
            <h1 className="text-xl font-semibold">Generated Image</h1>
          </div>
          {content && (
            <button
              onClick={handleDownload}
              className="flex items-center mb-2 cursor-pointer active:scale-95 gap-2 bg-gradient-to-r from-[#00AD25] to-[#17632e] text-white px-3 py-1 rounded-lg text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          )}
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
              <Image className="w-9 h-9" />
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

export default GenerateImages;
