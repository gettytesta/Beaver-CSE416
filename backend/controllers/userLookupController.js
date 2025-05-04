const User = require('../models/user');

exports.getAuthenticatedUsers = async (req, res) => {
  try {
    const users = await User.find(
      {
        $or: [
          { isGuest: false },           // explicitly marked non-guest
          { isGuest: { $exists: false } } // no isGuest field (default real users)
        ]
      },
      "username email"
    ).lean();

    res.json({ success: true, users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ success: false, message: "Server error fetching users." });
  }
};