const PERMISSIONS = [
    {
        screen: "Dashboard",
        key: "screen.dashboard",
        actions: [
            { id: "dashboard.view", label: "View Dashboard" },
            { id: "stats.view", label: "View Statistics" }
        ]
    },
    {
        screen: "Members Directory",
        key: "screen.members",
        actions: [
            { id: "member.view", label: "View Members List" },
            { id: "member.create", label: "Add New Member" },
            { id: "member.edit", label: "Edit Member" },
            { id: "member.delete", label: "Delete Member" }
        ]
    },
    {
        screen: "Committee (All Members)",
        key: "screen.committee",
        actions: [
            { id: "committee.view", label: "View Committee Tab" }
        ]
    },
    {
        screen: "Family Trees",
        key: "screen.family",
        actions: [
            { id: "family.view", label: "View Family Trees" },
            { id: "family.edit", label: "Edit Family Structures" }
        ]
    },
    {
        screen: "User Permissions (Admin)",
        key: "screen.admin",
        actions: [
            { id: "admin.access", label: "Access Admin Panel" },
            { id: "users.manage", label: "Manage Users (Invite/Approve)" }
        ]
    }
];

module.exports = PERMISSIONS;
