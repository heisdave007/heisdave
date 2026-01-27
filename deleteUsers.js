import mongoose from "mongoose";
import { User } from "./schemas/userSchema.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, 'config.env') });

const deleteAllUsers = async () => {
  try {
    // Connect to MongoDB
    const mongoUrl = process.env.MONGODB_URL;
    if (!mongoUrl) {
      throw new Error("MONGODB_URL not found in environment variables");
    }
    await mongoose.connect(mongoUrl);
    console.log("Connected to MongoDB");

    // Delete all users
    const result = await User.deleteMany({});
    console.log(`✓ Deleted ${result.deletedCount} users from the database`);

    // Close connection
    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (err) {
    console.error("Error deleting users:", err.message);
    process.exit(1);
  }
};

deleteAllUsers();
