const mongoose = require('mongoose');
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

/**
 * @swagger
 * /api/family/tree-data/{memberId}:
 *   get:
 *     summary: Get complete family tree data for a specific member
 *     tags: [Family]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of family members for the tree
 */
router.get('/tree-data/:memberId', verifyToken, async (req, res) => {
    try {
        const { memberId } = req.params;

        // 1. Fetch Target Member
        // Try finding by Mongo ID first, then Member ID
        let targetMember;
        if (mongoose.Types.ObjectId.isValid(memberId)) {
            targetMember = await Member.findById(memberId);
        }
        if (!targetMember) {
            targetMember = await Member.findOne({ memberId: memberId });
        }

        if (!targetMember) {
            return res.status(404).json({ message: 'Member not found' });
        }

        // 2. Fetch Core Family (Same Family ID)
        // If target has no family ID, core family is just them
        let coreFamily = [];
        if (targetMember.familyId && targetMember.familyId !== 'Unassigned' && targetMember.familyId !== 'FNew') {
            coreFamily = await Member.find({ familyId: targetMember.familyId });
        } else {
            coreFamily = [targetMember];
        }

        // 3. Extended Search (Cross-Family)
        // We want to find:
        // - Parents of Core Members (even if in different family)
        // - Children of Core Members (even if in different family)
        // - Spouses of ALL the above (Core + Extended)

        const coreIds = coreFamily.map(m => m._id);
        const coreMongoIds = coreFamily.map(m => m._id); // ensure ObjectIds

        // Find direct relatives (Parents or Children) of the Core Family who are NOT in the Core Family
        const extendedRelatives = await Member.find({
            familyId: { $ne: targetMember.familyId }, // different family
            $or: [
                { _id: { $in: coreFamily.flatMap(m => [m.fatherId, m.motherId]).filter(Boolean) } }, // Parents of core
                { fatherId: { $in: coreMongoIds } }, // Children of core
                { motherId: { $in: coreMongoIds } }  // Children of core
            ]
        });

        // Combine Core + Extended so far
        let knownMembers = [...coreFamily, ...extendedRelatives];
        const knownIds = knownMembers.map(m => m._id);

        // 3.5. Fetch Level 2 Extended (Grandchildren, Siblings, etc.)
        // We want children of the "Extended Relatives" we just found.
        // e.g. If we found a "Married Daughter" (Extended), we want her children (Grandkids).
        // e.g. If we found a "Father" (Extended), we want his other children (Siblings).
        
        const extendedIds = extendedRelatives.map(m => m._id); // ensure ObjectIds

        const level2Relatives = await Member.find({
            familyId: { $ne: targetMember.familyId }, // Still exclude core (already have them)
            $and: [{ _id: { $nin: knownIds } }], // Exclude what we already have
            $or: [
                { fatherId: { $in: extendedIds } },
                { motherId: { $in: extendedIds } }
            ]
        });

        knownMembers = [...knownMembers, ...level2Relatives];
        // Re-calc knownIds
        const allKnownIds = knownMembers.map(m => m._id);

        // 4. Fetch Spouses of EVERYONE found so far (Core + L1 + L2)
        const spouseIdsToFind = knownMembers.map(m => m.spouseId).filter(Boolean);

        const spouses = await Member.find({
            $or: [
                { _id: { $in: spouseIdsToFind } }, // Spouses referenced by known members
                { spouseId: { $in: allKnownIds } }    // Members referencing known members as spouse
            ]
        });

        // 5. Merge and Unique
        const allMembers = [...knownMembers, ...spouses];
        
        // Remove duplicates based on _id
        const uniqueMembersMap = new Map();
        allMembers.forEach(m => {
            uniqueMembersMap.set(m._id.toString(), m);
        });

        const finalMemberList = Array.from(uniqueMembersMap.values());

        res.json(finalMemberList);

    } catch (err) {
        console.error("Tree Data Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
