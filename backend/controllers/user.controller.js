import User from "../models/user.model.js";

export const getUserForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");
    return res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUserForSidebar: " + error.message);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { profilePic, fullName } = req.body;

    const updates = {};
    if (fullName && fullName.trim()) updates.fullName = fullName.trim();
    if (profilePic) updates.profilePic = profilePic;

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Error in updateProfile controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
