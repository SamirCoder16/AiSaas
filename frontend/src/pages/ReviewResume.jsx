import { FileText, Loader, Sparkles } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import Markdown from "react-markdown";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const ReviewResume = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken } = useAuth();

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("resume", input);

      const { data } = await axios.post("/api/ai/resume-review", formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      if (data.success) {
        setContent(data.content);
        toast.success("Boooyah!");
      } else {
        toast.error(data.message || "something went wrong!");
      }
    } catch (error) {
      toast.error("Oops! Something went wrong.");
    } finally {
      setLoading(false);
    }

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
          <Sparkles className="w-6 text-[#00DA83]" />
          <h1 className="text-xl font-semibold">Resume Review</h1>
        </div>
        <p className="mt-6 text-sm font-medium">Upload Resume</p>
        <input
          type="file"
          required
          onChange={(e) => setInput(e.target.files[0])}
          accept="application/pdf"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600"
        />

        <p className="text-xs text-gray-600 font-light mt-2">
          Supports "PDF" formats only
        </p>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00DA83] to-[#009BB3] text-white px-4 py-2 mt-6 text-sm rounded-lg  ${
            loading
              ? "opacity-50 cursor-not-allowed"
              : " active:scale-95 cursor-pointer"
          }`}
        >
          {loading ? (
            <>
              <Loader className="w-5 animate-spin" /> <span>Reviewing...</span>
            </>
          ) : (
            <>
              <FileText className="w-5" /> <span>Review Resume</span>
            </>
          )}
        </button>
      </form>

      {/* Right col */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px] ">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-[#00DA83]" />
          <h1 className="text-xl font-semibold">Analysis result</h1>
        </div>

        {loading ? (
          // Skeleton Loader
          <div className="flex-1 p-4 space-y-4 animate-pulse">
            {/* Header section */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>

            {/* Score section */}
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </div>

            {/* Strengths section */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="space-y-1">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                <div className="h-3 bg-gray-200 rounded w-4/5"></div>
              </div>
            </div>

            {/* Improvements section */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-2/5"></div>
              <div className="space-y-1">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>

            {/* Recommendations section */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-2/5"></div>
              <div className="space-y-1">
                <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        ) : content ? (
          // Show actual content when available
          <div className="mt-3 h-full overflow-x-hidden overflow-y-scroll text-sm text-slate-600">
           <div className="reset-tw">
             <Markdown>{content}</Markdown>
           </div>
          </div>
        ) : (
          // Default empty state
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <FileText className="w-9 h-9" />
              <p>
                Upload your resume and click "Review Resume" to get started.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewResume;
