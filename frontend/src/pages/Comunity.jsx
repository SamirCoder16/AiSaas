import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Comunity = () => {
  const [creation, setcreation] = useState([]);
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);

  const { getToken } = useAuth();

  const fetchCretaions = async () => {
    try {
      const { data } = await axios.get("api/user/get-published-creation", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });
      if (data.success) {
        setcreation(data.creations);
      } else {
        toast.error("Failed to fetch creations:", data.error);
      }
    } catch (error) {
      console.error("Error fetching creations:", error);
      toast.error("Error fetching creations");
    }
  };

  const imageLikeToggle = async (id) => {
    // Check if user is already liked
    const currentCreation = creation.find((item) => item.id === id);
    const isCurrentlyLiked = currentCreation?.likes.includes(user?.id);

    // Show instant toast notification
    if (isCurrentlyLiked) {
      toast.success("Creation unliked!", { duration: 1500 });
    } else {
      toast.success("Creation Liked! ❤️", { duration: 1500 });
    }

    // Optimistic update - instantly update UI
    setcreation((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const isLiked = item.likes.includes(user?.id);
          return {
            ...item,
            likes: isLiked
              ? item.likes.filter((likeId) => likeId !== user?.id)
              : [...item.likes, user?.id],
          };
        }
        return item;
      })
    );

    // Background API call without blocking UI
    try {
      const { data } = await axios.post(
        "api/user/toggle-like-creation",
        { id },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );

      if (!data.success) {
        // Revert optimistic update on failure
        setcreation((prev) =>
          prev.map((item) => {
            if (item.id === id) {
              const isCurrentlyLiked = item.likes.includes(user?.id);
              return {
                ...item,
                likes: isCurrentlyLiked
                  ? item.likes.filter((likeId) => likeId !== user?.id)
                  : [...item.likes, user?.id],
              };
            }
            return item;
          })
        );
        toast.error("Failed to toggle like. Please try again.");
      }
    } catch (error) {
      // Revert optimistic update on error
      setcreation((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            const isCurrentlyLiked = item.likes.includes(user?.id);
            return {
              ...item,
              likes: isCurrentlyLiked
                ? item.likes.filter((likeId) => likeId !== user?.id)
                : [...item.likes, user?.id],
            };
          }
          return item;
        })
      );
      toast.error("Connection error. Please check your internet.");
    }
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchCretaions().finally(() => setLoading(false));
    }
  }, [user]);

  return !loading ? (
    <div className="flex-1 h-full flex flex-col gap-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header Section */}
      <div className="relative bg-white rounded-2xl p-8 shadow-2xl border border-gray-200 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-500/10 to-orange-500/10 rounded-full translate-y-12 -translate-x-12"></div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-8 bg-gradient-to-b from-blue-500 to-purple-700 rounded-full shadow-lg"></div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text text-transparent">
              Community
            </h1>
          </div>

          <p className="text-lg text-gray-600 font-medium leading-relaxed">
            Discover amazing AI creations from our talented community
          </p>
        </div>
      </div>

      <div className="bg-white h-full rounded-2xl overflow-y-scroll shadow-xl border border-gray-200 p-4">
        {creation.length > 0 ? (
          creation.map((creation, idx) => (
            <div
              key={idx}
              className="relative group inline-block pl-3 pt-3 w-full sm:max-w/2 lg:max-w-1/3"
            >
              <img
                src={creation.content}
                alt="content"
                className="w-full h-full object-cover rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              />

              <div className="absolute bottom-0 top-0 right-0 left-3 flex gap-2 items-end justify-end group-hover:justify-between p-3 group-hover:bg-gradient-to-b from-transparent to-black/80 text-white rounded-lg transition-all duration-300">
                <p className="text-sm hidden group-hover:block font-medium">
                  {creation.prompt}
                </p>
                <div className="flex gap-1 items-center bg-black/30 rounded-full px-2 py-1 backdrop-blur-sm">
                  <p className="text-sm font-semibold">
                    {creation.likes.length}
                  </p>
                  <Heart
                    onClick={() => imageLikeToggle(creation.id)}
                    className={`min-w-5 h-5 hover:scale-110 cursor-pointer transition-transform ${
                      creation.likes.includes(user?.id)
                        ? "fill-red-500 text-red-600"
                        : "text-white"
                    }`}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <div className="text-6xl mb-4">🎨</div>
              <p className="text-lg font-medium">No creations found</p>
              <p className="text-sm">Be the first to share your AI creation!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-full">
      <span className="w-10 h-10 my-1 rounded-full border-3 border-primary border-t-transparent animate-spin"></span>
    </div>
  );
};

export default Comunity;
