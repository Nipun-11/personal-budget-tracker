const express = require("express");
const Group = require("../models/Group");
const router = express.Router();

// Create Group with case-insensitive duplicate check
router.post("/", async (req, res) => {
  try {
    console.log('📝 Creating group with data:', req.body);
    
    const { name, members, description } = req.body;
    
    // Validate input
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Group name is required" });
    }
    
    if (!members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ message: "At least one member is required" });
    }
    
    // Case-insensitive duplicate check
    const existing = await Group.findOne({ name: name.trim() })
      .collation({ locale: 'en', strength: 2 });
    
    if (existing) {
      console.log(`❌ Duplicate group name detected: "${name}"`);
      return res.status(400).json({ 
        message: "Group name already exists (case-insensitive)" 
      });
    }

    // Clean members array
    const cleanMembers = members.filter(member => member && member.trim());
    
    // Create group
    const group = new Group({
      name: name.trim(),
      members: cleanMembers,
      admins: [cleanMembers[0]], // First member is admin
      description: description?.trim() || '',
      expenses: [],
      settlements: []
    });

    const savedGroup = await group.save();
    console.log('✅ Group created successfully:', savedGroup.name);
    
    res.status(201).json(savedGroup);
  } catch (err) {
    console.error('❌ Error creating group:', err);
    
    if (err.code === 11000) {
      return res.status(400).json({ 
        message: "Group name already exists" 
      });
    }
    
    res.status(500).json({ message: err.message });
  }
});

// Get all groups
router.get("/", async (req, res) => {
  try {
    const groups = await Group.find({ isActive: true })
      .collation({ locale: 'en', strength: 2 })
      .sort({ updatedAt: -1 });
    
    const groupsWithDefaults = groups.map(group => ({
      ...group.toObject(),
      members: group.members || [],
      expenses: group.expenses || [],
      settlements: group.settlements || [],
      admins: group.admins || []
    }));
    
    res.json(groupsWithDefaults);
  } catch (err) {
    console.error('❌ Error fetching groups:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get specific group
router.get("/:groupId", async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    const groupWithDefaults = {
      ...group.toObject(),
      members: group.members || [],
      expenses: group.expenses || [],
      settlements: group.settlements || [],
      admins: group.admins || []
    };
    
    res.json(groupWithDefaults);
  } catch (error) {
    console.error('❌ Error fetching group:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update group members
router.put("/:groupId/members", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { members } = req.body;
    
    console.log('🔄 Updating members for group:', groupId);
    console.log('📝 New members:', members);
    
    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ 
        message: "Members array is required and must not be empty" 
      });
    }
    
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    // Clean and validate members
    const cleanMembers = members
      .map(member => member?.toString().trim())
      .filter(member => member && member.length > 0);
    
    if (cleanMembers.length === 0) {
      return res.status(400).json({ 
        message: "At least one valid member is required" 
      });
    }
    
    // Update group members
    group.members = cleanMembers;
    
    // Ensure at least one admin exists
    if (!group.admins || group.admins.length === 0) {
      group.admins = [cleanMembers[0]];
    } else {
      // Remove admins that are no longer members
      group.admins = group.admins.filter(admin => cleanMembers.includes(admin));
      if (group.admins.length === 0) {
        group.admins = [cleanMembers[0]];
      }
    }
    
    const savedGroup = await group.save();
    
    console.log('✅ Members updated successfully');
    res.json(savedGroup);
    
  } catch (error) {
    console.error('❌ Error updating group members:', error);
    res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
});

// Add expense to group
router.post("/:groupId/expenses", async (req, res) => {
  try {
    const { groupId } = req.params;
    const expenseData = req.body;
    
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    // Validate that paidBy is a group member
    if (!group.members.includes(expenseData.paidBy)) {
      return res.status(400).json({ 
        message: "Expense payer must be a group member" 
      });
    }
    
    // Validate split details members
    const invalidMembers = expenseData.splitDetails?.filter(
      split => !group.members.includes(split.member)
    );
    
    if (invalidMembers && invalidMembers.length > 0) {
      return res.status(400).json({ 
        message: "All split members must be group members" 
      });
    }
    
    if (!group.expenses) {
      group.expenses = [];
    }
    
    group.expenses.push({
      ...expenseData,
      comments: [],
      isActive: true
    });
    
    const savedGroup = await group.save();
    
    console.log('✅ Expense added successfully');
    res.json(savedGroup);
  } catch (error) {
    console.error('❌ Error adding expense:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update expense
router.put("/:groupId/expenses/:expenseId", async (req, res) => {
  try {
    const { groupId, expenseId } = req.params;
    const updateData = req.body;
    
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    const expenseIndex = group.expenses.findIndex(
      expense => expense._id.toString() === expenseId
    );
    
    if (expenseIndex === -1) {
      return res.status(404).json({ message: "Expense not found" });
    }
    
    // Update expense
    group.expenses[expenseIndex] = {
      ...group.expenses[expenseIndex].toObject(),
      ...updateData,
      updatedAt: new Date()
    };
    
    const savedGroup = await group.save();
    res.json(savedGroup);
    
  } catch (error) {
    console.error('❌ Error updating expense:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete expense
router.delete("/:groupId/expenses/:expenseId", async (req, res) => {
  try {
    const { groupId, expenseId } = req.params;
    
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    group.expenses = group.expenses.filter(
      expense => expense._id.toString() !== expenseId
    );
    
    const savedGroup = await group.save();
    res.json(savedGroup);
    
  } catch (error) {
    console.error('❌ Error deleting expense:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add comment to expense
router.post("/:groupId/expenses/:expenseId/comments", async (req, res) => {
  try {
    const { groupId, expenseId } = req.params;
    const { author, text } = req.body;
    
    if (!author || !text) {
      return res.status(400).json({ message: "Author and text are required" });
    }
    
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    const expense = group.expenses.find(
      expense => expense._id.toString() === expenseId
    );
    
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    
    if (!expense.comments) {
      expense.comments = [];
    }
    
    expense.comments.push({
      author: author.trim(),
      text: text.trim(),
      timestamp: new Date()
    });
    
    const savedGroup = await group.save();
    res.json(savedGroup);
    
  } catch (error) {
    console.error('❌ Error adding comment:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add settlement
router.post("/:groupId/settlements", async (req, res) => {
  try {
    const { groupId } = req.params;
    const settlementData = req.body;
    
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    if (!group.settlements) {
      group.settlements = [];
    }
    
    group.settlements.push({
      ...settlementData,
      settledAt: new Date(),
      isSettled: true
    });
    
    const savedGroup = await group.save();
    res.json(savedGroup);
    
  } catch (error) {
    console.error('❌ Error adding settlement:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete group
router.delete("/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    
    console.log('🗑️ Deleting group:', groupId);
    
    const group = await Group.findByIdAndUpdate(
      groupId,
      { isActive: false },
      { new: true }
    );
    
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    console.log('✅ Group deleted successfully');
    res.json({ 
      message: "Group deleted successfully",
      groupId: groupId 
    });
    
  } catch (error) {
    console.error('❌ Error deleting group:', error);
    res.status(500).json({ 
      message: "Internal server error",
      error: error.message 
    });
  }
});

module.exports = router;
