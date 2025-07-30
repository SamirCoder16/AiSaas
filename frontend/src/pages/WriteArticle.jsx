import { Edit, Loader, Sparkles } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const WriteArticle = () => {
  const articleLength = [
    { length: 800, text: `Short (500-800 words)` },
    { length: 1200, text: `Medium (800-1200 words)` },
    { length: 1600, text: `Long (1200+ words)` },
  ];

  const [selectedLength, setselectedLength] = useState(articleLength[0]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken } = useAuth();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const prompt = `Write an article about ${input} in ${selectedLength.text} words.`;
      const { data } = await axios.post(
        "/api/ai/generate-article",
        {
          prompt,
          length: selectedLength.length,
        },
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
        toast.error(data.message);
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

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* Left col */}
      <form
        onSubmit={handleFormSubmit}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#4A7AFF]" />
          <h1 className="text-xl font-semibold">Article Configuration</h1>
        </div>
        <p className="mt-6 text-sm font-medium">Article Topic</p>
        <input
          type="text"
          required
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
          placeholder="The future of AI is......"
        />
        <p className="mt-4 text-sm font-medium">Article Length</p>

        <div className="mt-3 flex gap-3 flex-wrap sm:max-w-9/11">
          {articleLength.map((item, idx) => (
            <span
              key={idx}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${
                selectedLength.length === item.length
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 border-gray-300"
              }`}
              onClick={() => setselectedLength(item)}
            >
              {item.text}
            </span>
          ))}
        </div>
        <br />
        <button
          disabled={loading}
          type="submit"
          className={`w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#226BFF] to-[#65ADFF] text-white px-4 py-2 mt-6 text-sm rounded-lg ${
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
              <Edit className="w-5" /> <span>Generate Article</span>
            </>
          )}
        </button>
      </form>

      {/* Right col */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px] ">
        <div className="flex items-center gap-3">
          <Edit className="w-5 h-5 text-[#4A7AFF]" />
          <h1 className="text-xl font-semibold">Article Configuration</h1>
        </div>

        {loading ? (
          // Skeleton loading effect
          <div className="mt-3 h-full overflow-y-scroll">
            <div className="animate-pulse space-y-4">
              {/* Title skeleton */}
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>

              {/* Paragraph skeletons */}
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-11/12"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>

              {/* Subtitle skeleton */}
              <div className="h-5 bg-gray-200 rounded w-2/3 mt-6"></div>

              {/* Another subtitle skeleton */}
              <div className="h-5 bg-gray-200 rounded w-1/2 mt-6"></div>

              {/* Final paragraph skeletons */}
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                <div className="h-4 bg-gray-200 rounded w-11/12"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ) : !content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <Edit className="w-9 h-9" />
              <p>Enter a topic and click "Generate Article" to get started.</p>
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

export default WriteArticle;
