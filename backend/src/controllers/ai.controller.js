import OpenAI from "openai";
import sql from "../configs/postgressDB.js";
import axios from "axios";
import { clerkClient } from "@clerk/express";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import pdf from "pdf-parse/lib/pdf-parse.js";

// Initialize OpenAI API client
const AI = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export const generateArticle = async (req, res) => {
  try {
    // Get userId from Clerk auth
    const userId = req.auth.userId;
    const { prompt, length } = req.body;

    // Get user metadata to check plan and usage
    const user = await clerkClient.users.getUser(userId);
    const plan = user.privateMetadata?.plan || "free";
    const free_usage = user.privateMetadata?.free_usage || 0;

    if (plan !== "premium" && free_usage >= 10) {
      return res.status(403).json({
        success: false,
        error: "You have exceeded your free usage limit.",
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: length,
    });

    const content = response.choices[0].message.content;

    await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'Article')`;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          ...user.privateMetadata,
          free_usage: free_usage + 1,
        },
      });
    }

    res.status(200).json({ success: true, content });
  } catch (error) {
    console.error("Error in generateArticle:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const generateBlogTitle = async (req, res) => {
  try {
    const { prompt } = req.body;
    const userId = req.auth.userId;

    // Get user metadata to check plan and usage
    const user = await clerkClient.users.getUser(userId);
    const plan = user.privateMetadata?.plan || "free";
    const free_usage = user.privateMetadata?.free_usage || 0;

    if (plan !== "premium" && free_usage >= 10) {
      return res.status(403).json({
        success: false,
        message: "You have exceeded your free usage limit.",
      });
    }

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: `Generate a blog title for an article about ${prompt}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const content = response.choices[0].message.content;

    await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${prompt}, ${content}, 'Blog Title')`;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          ...user.privateMetadata,
          free_usage: free_usage + 1,
        },
      });
    }
    res.status(200).json({ success: true, content });
  } catch (error) {
    console.error("Error in generateBlogTitle:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const generateImages = async (req, res) => {
  try {
    const { prompt, publish } = req.body;
    const userId = req.auth.userId;
    const user = await clerkClient.users.getUser(userId);
    const free_usage = user.privateMetadata?.free_usage || 0;

    // Get user metadata to check plan and usage
    const plan = req.plan;

    if (plan !== "premium" && free_usage >= 3) {
      return res.status(403).json({
        success: false,
        message:
          "You have exceeded your free usage limit. Please upgrade to premium.",
      });
    }

    const formData = new FormData();
    formData.append("prompt", prompt);

    try {
      const { data } = await axios.post(
        `${process.env.CLIPDROP_API}`,
        formData,
        {
          headers: { "x-api-key": process.env.CLIPDROP_API_KEY },
          responseType: "arraybuffer",
        }
      );

      const base64Image = `data:image/png;base64,${Buffer.from(data).toString(
        "base64"
      )}`;

      const { secure_url } = await cloudinary.uploader.upload(base64Image);

      await sql`INSERT INTO creations (user_id, prompt, content, type, publish) VALUES (${userId}, ${prompt}, ${secure_url}, 'Image', ${
        publish ?? false
      })`;

      if (plan !== "premium") {
        await clerkClient.users.updateUserMetadata(userId, {
          privateMetadata: {
            ...user.privateMetadata,
            free_usage: free_usage + 1,
          },
        });
      }

      res.status(200).json({ success: true, imageUrl: secure_url });
    } catch (apiError) {
      // Handle ClipDrop API errors
      if (apiError.response && apiError.response.data) {
        const errorMessage = Buffer.from(apiError.response.data).toString();
        const errorData = JSON.parse(errorMessage);

        if (errorData.error && errorData.error.includes("Not enough credits")) {
          return res.status(402).json({
            success: false,
            error:
              "ClipDrop API credits exhausted. Please check your API billing.",
          });
        }
      }
      throw apiError; // Re-throw if it's not a credits error
    }
  } catch (error) {
    console.error("Error in generateImages:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const removeBackground = async (req, res) => {
  try {
    const image = req.file;
    const userId = req.auth.userId;
    const user = await clerkClient.users.getUser(userId);
    const free_usage = user.privateMetadata?.free_usage || 0;

    // Get user metadata to check plan and usage
    const plan = req.plan;

    if (plan !== "premium" && free_usage >= 10) {
      return res.status(403).json({
        success: false,
        message:
          "You have exceeded your free usage limit. Please upgrade to premium.",
      });
    }

    const { secure_url } = await cloudinary.uploader.upload(image.path, {
      transformation: [
        {
          effect: "background_removal",
          background_removal: "remove_the_background",
        },
      ],
    });

    await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, 'Remove background from image' , ${secure_url}, 'Image')`;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          ...user.privateMetadata,
          free_usage: free_usage + 1,
        },
      });
    }

    res.status(200).json({ success: true, content: secure_url });
  } catch (apiError) {
    console.log("Error in removeBackground:", apiError);
    res.status(500).json({ success: false, error: apiError.message });
  }
};

export const removeImageObject = async (req, res) => {
  try {
    const image = req.file;
    const { object } = req.body;
    const userId = req.auth.userId;
    const user = await clerkClient.users.getUser(userId);
    const free_usage = user.privateMetadata?.free_usage || 0;

    // Get user metadata to check plan and usage
    const plan = req.plan;

    if (plan !== "premium" && free_usage >= 10) {
      return res.status(403).json({
        success: false,
        message:
          "You have exceeded your free usage limit. Please upgrade to premium.",
      });
    }

    const { public_id } = await cloudinary.uploader.upload(image.path);

    const imageUrl = cloudinary.url(public_id, {
      transformation: [
        {
          effect: `gen_remove:${object}`,
          object_removal: "remove the object",
        },
      ],
      resource_type: "image",
    });

    await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, ${`Remove ${object} from image`} , ${imageUrl}, 'Image')`;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          ...user.privateMetadata,
          free_usage: free_usage + 1,
        },
      });
    }

    res.status(200).json({ success: true, content: imageUrl });
  } catch (apiError) {
    console.log("Error in removeImageObject:", apiError);
    res.status(500).json({ success: false, error: apiError.message });
  }
};

export const resumeReview = async (req, res) => {
  try {
    const resume = req.file;
    const userId = req.auth.userId;
    const user = await clerkClient.users.getUser(userId);
    const free_usage = user.privateMetadata?.free_usage || 0;

    // Get user metadata to check plan and usage
    const plan = req.plan;

    if (plan !== "premium" && free_usage >= 10) {
      return res.status(403).json({
        success: false,
        message:
          "You have exceeded your free usage limit. Please upgrade to premium.",
      });
    }

    if (resume.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "Resume file size exceeds the 5MB limit.",
      });
    }

    const dataBuffer = fs.readFileSync(resume.path);
    const pdfData = await pdf(dataBuffer);
    const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement. Resume content:\n\n${pdfData.text}`;

    const response = await AI.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;

    await sql`INSERT INTO creations (user_id, prompt, content, type) VALUES (${userId}, 'Review the uploaded resume', ${content}, 'resume review')`;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          ...user.privateMetadata,
          free_usage: free_usage + 1,
        },
      });
    }

    res.status(200).json({ success: true, content: content });
  } catch (apiError) {
    console.log("Error in removeImageObject:", apiError);
    res.status(500).json({ success: false, error: apiError.message });
  }
};
