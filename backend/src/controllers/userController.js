const User = require('../models/User');

const getUsers = async (req, res) => {
  try {
    // Only admin can list users
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admin can view user list' });
    }
    
    const users = await User.find({ isActive: true }).select('-password');
    
    res.json({
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    // Users can only view their own profile, admins can view any
    if (req.userRole === 'seller' && req.params.id !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to view this user' });
    }
    
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, address, company } = req.body;
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (company) user.company = company;
    if (address) user.address = address;
    
    await user.save();
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deactivateUser = async (req, res) => {
  try {
    // Only admin can deactivate users
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admin can deactivate users' });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.isActive = false;
    await user.save();
    
    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUserProfile,
  deactivateUser
};
