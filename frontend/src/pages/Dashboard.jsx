import { useEffect, useState } from "react";
import { dummyCreationData } from "../assets/assets";
import { Gem, Sparkles } from "lucide-react";
import { Protect, useAuth } from "@clerk/clerk-react";
import CreationItem from "../components/CreationItem";
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Dashboard = () => {
  const [creation, setCreation] = useState([]);
  const [loading, setLoading] = useState(false);

  const { getToken } = useAuth();

  const getDashBoardData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("api/user/get-user-creations", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      if (data.success) {
        setCreation(data.creations);
      } else {
        console.error("Failed to fetch creations:", data.error);
      }
    } catch (error) {
      console.error("Error fetching creations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDashBoardData();
  }, []);

  return (
    <div className="h-full overflow-y-scroll p-6">
      <div className="flex justify-start gap-4 flex-wrap">
        {/* Total Cretaion Card */}
        <div className="flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200">
          <div className="text-gray-600">
            <p className="text-sm">{creation.length === 1 ? "Total Creation" : "Total Creations"}</p>
            <h2 className="text-xl font-semibold">{creation.length}</h2>
          </div>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3588F2] to-[#0BB0D7] text-white flex justify-center items-center">
            <Sparkles className="w-5 text-white" />
          </div>
        </div>

        {/* Active Plan Card */}
        <div className="flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200">
          <div className="text-gray-600">
            <p className="text-sm">Active Plan</p>
            <h2 className="text-xl font-semibold">
              <Protect plan="premium" fallback="Free">
                Premium
              </Protect>
            </h2>
          </div>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF61C5] to-[#9E53EE] text-white flex justify-center items-center">
            <Gem className="w-5 text-white" />
          </div>
        </div>
      </div>

      {loading ? (
        <>
          <div className="flex justify-center items-center h-3/4">
            <div className="animate-spin rounded-full h-11 w-11 border-3 border-purple-500 border-t-transparent"></div>
          </div>
        </>
      ) : (
        <div className="space-y-3">
          {creation.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-8">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full shadow-2xl transform rotate-12 opacity-20 absolute -top-2 -left-2"></div>
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full shadow-xl flex items-center justify-center transform -rotate-6 relative z-10">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="text-center mt-8">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  No creations yet
                </h3>
                <p className="text-gray-500 text-lg font-medium transform perspective-1000 hover:scale-105 transition-transform duration-300">
                  Start creating amazing content!
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      Recent Creations
                    </h2>
                  </div>
                </div>
              </div>
              <div className="grid gap-4">
                {creation.map((item) => (
                  <div
                    key={item.id}
                    className="transform hover:scale-[1.01] transition-all duration-200"
                  >
                    <CreationItem item={item} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
