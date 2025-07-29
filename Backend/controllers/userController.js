const User = require('../models/user');

// Get User by ID

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// Update User Profile
exports.updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    let updates = req.body;

    // Handle file upload if present
    if (req.file) {
      updates.profileImage = req.file.path;
    }

    // Validate updates
    const { error } = userSchema.validate(updates);
    if (error) {
      return res.status(400).json({ message: 'Invalid input', details: error.details });
    }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
