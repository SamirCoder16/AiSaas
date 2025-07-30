import { useState } from "react";
import { Hash, Loader, Sparkles } from "lucide-react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import Markdown from "react-markdown";
import toast from "react-hot-toast";

// set the base url for axios requests
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const BlogTitles = () => {
  const blogCategories = [
    "General",
    "Technology",
    "Health",
    "Lifestyle",
    "Travel",
    "Education",
    "Finance",
    "Entertainment",
    "Food",
    "Sports",
  ];

  const [selectedCategory, setselectedCategory] = useState(blogCategories[0]);
  const [input, setInput] = useState("");
  const [loading, setloading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken } = useAuth();

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // Handle form submission logic here
    setloading(true);
    const prompt = `Generate a blog title for the keyword ${input} in the category ${selectedCategory}.`;
    try {
      const { data } = await axios.post(
        `/api/ai/generate-title`,
        {
          prompt,
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );

      if (data.success) {
        setContent(data.content);
        toast.success("Booyah!");
      } else {
        toast.error(data.message || "Failed to generate title.");
      }
    } catch (error) {
      console.error("Error generating title:", error);
      toast.error(
        "You have exceeded your free usage limit. Please upgrade to premium."
      );
    } finally {
      setloading(false);
    }

    // Reset form fields
    setInput("");
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* Left col */}
      <form
        onSubmit={handleFormSubmit}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#8E37EB]" />
          <h1 className="text-xl font-semibold">AI Title Generator</h1>
        </div>
        <p className="mt-6 text-sm font-medium">Keyword</p>
        <input
          type="text"
          required
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
          placeholder="The future of AI is......"
        />
        <p className="mt-4 text-sm font-medium">Category</p>

        <div className="mt-3 flex gap-3 flex-wrap sm:max-w-9/11">
          {blogCategories.map((item, idx) => (
            <span
              key={idx}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${
                selectedCategory === item
                  ? "bg-purple-50 text-purple-600"
                  : "text-gray-500 border-gray-300"
              }`}
              onClick={() => setselectedCategory(item)}
            >
              {item}
            </span>
          ))}
        </div>
        <br />
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#C341F6] to-[#8E37EB] text-white px-4 py-2 mt-6 text-sm rounded-lg ${
            loading
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer active:scale-95"
          }`}
        >
          {loading ? (
            <>
              <Loader className="animate-spin w-5" /> <span>Generating...</span>
            </>
          ) : (
            <>
              {" "}
              <Hash className="w-5" /> <span>Generate Title</span>
            </>
          )}
        </button>
      </form>

      {/* Right col */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px] ">
        <div className="flex items-center gap-3">
          <Hash className="w-5 h-5 text-[#8E37EB]" />
          <h1 className="text-xl font-semibold">Generated Title</h1>
        </div>

        {loading ? (
          <div className="mt-3 h-full space-y-3">
            {/* Skeleton lines */}
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 mt-7 rounded w-1/2 flex flex-wrap items-start gap-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-7/4"></div>
              </div>
            </div>
          </div>
        ) : !content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <Hash className="w-9 h-9" />
              <p>Enter keyword and click "Generate Title" to get started.</p>
            </div>
          </div>
        ) : (
          <div className="mt-3 h-full overflow-y-scroll text-sm text-slate-600">
            <div className="reset-tw">
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogTitles;
