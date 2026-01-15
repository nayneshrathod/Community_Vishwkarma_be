const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Family
 *   description: Family Management
 */
const Member = require('../models/Member');
const User = require('../models/User');
const { verifyToken } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/family/my-family:
 *   get:
 *     summary: Get my family members
 *     tags: [Family]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Family details
 */
router.get('/my-family', verifyToken, async (req, res) => {
    try {
        const memberId = req.user.memberId;
        if (!memberId) return res.status(400).json({ message: 'User is not linked to a member profile' });

        // 1. Get Current Member Profile to find Family ID
        const currentMember = await Member.findOne({ memberId });
        if (!currentMember) return res.status(404).json({ message: 'Member profile not found' });

        // 2. Fetch Core Family (Same Family ID)
        const coreFamily = await Member.find({ familyId: currentMember.familyId });
        
        // 3. Extended Search (Fetch relatives in different Family IDs)
        // Collect IDs of core family to find their relatives
        const coreIds = coreFamily.map(m => m._id);
        const coreMemberIds = coreFamily.map(m => m.memberId);
        const parentIds = coreFamily.flatMap(m => [m.fatherId, m.motherId]).filter(id => id);

        // Find:
        // A. Parents of Core Members (if not in core)
        // B. Children of Core Members (if not in core, e.g. married daughters)
        // C. Siblings of Core Members (share parents, e.g. married sisters)
        
        const extendedMembers = await Member.find({
            familyId: { $ne: currentMember.familyId }, // Exclude already found
            $or: [
                { _id: { $in: parentIds } }, // Parents
                { fatherId: { $in: coreIds } }, // Children (Father is core)
                { motherId: { $in: coreIds } }, // Children (Mother is core)
                // Siblings: Share a parent with any core member (who has parents)
                // We need to match against the *parents* of the core members
                { fatherId: { $in: parentIds } },
                { motherId: { $in: parentIds } }
            ]
        });

        const allMembers = [...coreFamily, ...extendedMembers];
        
        // Remove duplicates (just in case)
        const uniqueMembers = Array.from(new Map(allMembers.map(item => [item['memberId'], item])).values());

        // 4. For each member, check if they have a User account and fetch its permissions
        const familyData = await Promise.all(uniqueMembers.map(async (member) => {
            const user = await User.findOne({ memberId: member.memberId }).select('username role permissions isVerified');
            return {
                member: member,
                user: user || null
            };
        }));

        res.json({
            familyId: currentMember.familyId,
            isPrimary: currentMember.isPrimary,
            members: familyData
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /api/family/permissions/{targetMemberId}:
 *   put:
 *     summary: Update family member permissions
 *     tags: [Family]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: targetMemberId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Permissions updated
 */
router.put('/permissions/:targetMemberId', verifyToken, async (req, res) => {
    try {
        const myMemberId = req.user.memberId;
        const targetMemberId = req.params.targetMemberId;
        const { permissions } = req.body; // e.g., ['edit_profile', 'view_family']

        // 1. Verify Requestor is Primary
        const me = await Member.findOne({ memberId: myMemberId });
        if (!me || !me.isPrimary) {
            return res.status(403).json({ message: 'Access Denied: Only the Primary Member can manage permissions' });
        }

        // 2. Verify Target is in SAME Family
        const targetMember = await Member.findOne({ memberId: targetMemberId });
        if (!targetMember) return res.status(404).json({ message: 'Target member not found' });

        if (targetMember.familyId !== me.familyId) {
            return res.status(403).json({ message: 'Access Denied: You can only manage your own family' });
        }

        // 3. Update Target User Permissions
        const targetUser = await User.findOne({ memberId: targetMemberId });
        if (!targetUser) return res.status(404).json({ message: 'User account not found for this member' });

        targetUser.permissions = permissions;
        await targetUser.save();

        res.json({ message: 'Permissions updated successfully', permissions: targetUser.permissions });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
