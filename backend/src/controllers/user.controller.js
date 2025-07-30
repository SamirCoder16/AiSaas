import sql from "../configs/postgressDB.js";


export const getUserCreations = async (req,res) => {
    try {
        const { userId } = req.auth();

        const creations = await sql`SELECT * FROM creations WHERE user_id = ${userId} ORDER BY created_at DESC`;

        res.status(200).json({ success: true, creations });

    } catch (error) {
        console.error("Error in getUserCreations:", error);
        res.status(500).json({ success: false, error: error.message });
        
    }
};

export const getPublishCreation = async (req,res) => {
    try {
        const creations = await sql`SELECT * FROM creations WHERE publish = true ORDER BY created_at DESC`;

        res.status(200).json({ success: true, creations });
    } catch (error) {
        console.error("Error in getPublishCreation:", error);
        res.status(500).json({ success: false, error: error.message });
        
    }
};

export const togglePublishCreation = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body;

        const [creation] = await sql`SELECT * FROM creations WHERE id = ${id}`
        if (!creation) {
            return res.status(404).json({ success: false, error: "Creation not found" });
        }
        const currentLikes = creation.likes;
        const userIdStr = userId.toString();
        let updatedLikes;
        let message;

        if (creation.likes.includes(userIdStr)) {
            updatedLikes = currentLikes.filter(like => like !== userIdStr);
            message = "Creation unliked successfully";
        } else {
            updatedLikes = [...currentLikes, userIdStr];
            message = "Creation liked successfully";
        }

        const formatedArray = `{${updatedLikes.join(',')}}`;
        await sql`UPDATE creations SET likes = ${formatedArray}::text[] WHERE id = ${id}`;
        res.status(200).json({ success: true, message });
    } catch (error) {
        console.error("Error in togglePublishCreation:", error);
        res.status(500).json({ success: false, error: error.message });
        
    }
}