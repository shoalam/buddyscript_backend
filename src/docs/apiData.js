export const apiData = {
    title: "ERP API Live Tester",
    version: "1.0.0",
    baseUrl: "http://localhost:5001",
    endpoints: [
        {
            group: "Auth",
            items: [
                {
                    path: "/api/auth/register",
                    method: "POST",
                    desc: "Create a new user account with secure password hashing.",
                    isProtected: false,
                    mainTable: "users",
                    requiredFields: ["username", "email", "password"],
                    sideEffects: "Generates a session cookie for automatic login.",
                    body: {
                        username: "testuser",
                        email: "test@example.com",
                        password: "password123"
                    }
                },
                {
                    path: "/api/auth/login",
                    method: "POST",
                    desc: "Authenticate user and get access token via secure HTTP-Only cookie.",
                    isProtected: false,
                    mainTable: "users",
                    requiredFields: ["email", "password"],
                    sideEffects: "Generates JWT token and sets it as secure cookie.",
                    body: {
                        email: "test@example.com",
                        password: "password123"
                    }
                },
                {
                    path: "/api/auth/logout",
                    method: "POST",
                    desc: "Securely logout and invalidate the current session.",
                    isProtected: true,
                    mainTable: "sessions",
                    requiredFields: [],
                    sideEffects: "Clears session cookies and redirects to login."
                },
                {
                    path: "/api/auth/me",
                    method: "GET",
                    desc: "Retrieve details of the authenticated user currently logged in.",
                    isProtected: true,
                    mainTable: "users",
                    requiredFields: [],
                    sideEffects: "Verifies session validity."
                }
            ]
        },
        {
            group: "Journal & Social",
            items: [
                {
                    path: "/api/posts",
                    method: "POST",
                    desc: "Post text and media content. Supports attachments up to 5MB.",
                    isProtected: true,
                    mainTable: "posts",
                    requiredFields: ["content or image"],
                    sideEffects: "Increments user's post count.",
                    body: {
                        content: "Shared a new update!",
                        visibility: "public"
                    }
                },
                {
                    path: "/api/posts",
                    method: "GET",
                    desc: "List entries with the newest interactions displayed first.",
                    isProtected: true,
                    mainTable: "posts",
                    requiredFields: [],
                    sideEffects: "Aggregates likes and comments counts."
                },
                {
                    path: "/api/posts/:id",
                    method: "GET",
                    desc: "Retrieve full details and metadata for a specific entry ID.",
                    isProtected: true,
                    mainTable: "posts",
                    requiredFields: ["id"],
                    sideEffects: "Verifies entry visibility permissions."
                },
                {
                    path: "/api/posts/:id",
                    method: "DELETE",
                    desc: "Permanently remove a specific entry from the database.",
                    isProtected: true,
                    mainTable: "posts",
                    requiredFields: ["id"],
                    sideEffects: "Decrements user's post count."
                },
                {
                    path: "/api/posts/:id",
                    method: "PUT",
                    desc: "Modify an existing post (content, visibility, or image).",
                    isProtected: true,
                    mainTable: "posts",
                    requiredFields: ["id"],
                    sideEffects: "Supports formData for multipart image replacement.",
                    body: {
                        content: "Updated content",
                        visibility: "public",
                        removeImage: "true"
                    }
                }
            ]
        },
        {
            group: "Interactions",
            items: [
                {
                    path: "/api/posts/:postId/comments",
                    method: "POST",
                    desc: "Add a comment or a threaded reply to a post.",
                    isProtected: true,
                    mainTable: "comments",
                    requiredFields: ["content"],
                    sideEffects: "Increments total comments count for post.",
                    body: {
                        content: "This is a meaningful comment.",
                        parentCommentId: "optional_parent_id"
                    }
                },
                {
                    path: "/api/posts/:postId/comments",
                    method: "GET",
                    desc: "Retrieve comments and nested replies for a specific post.",
                    isProtected: true,
                    mainTable: "comments",
                    requiredFields: ["postId"],
                    sideEffects: "Groups nested replies efficiently."
                },
                {
                    path: "/api/posts/comments/:id",
                    method: "PUT",
                    desc: "Edit an existing comment or reply.",
                    isProtected: true,
                    mainTable: "comments",
                    requiredFields: ["id", "content"],
                    sideEffects: "Only allowed for the comment owner.",
                    body: {
                        content: "Updated comment text."
                    }
                },
                {
                    path: "/api/posts/comments/:id",
                    method: "DELETE",
                    desc: "Delete a specific comment or reply.",
                    isProtected: true,
                    mainTable: "comments",
                    requiredFields: ["id"],
                    sideEffects: "Decrements related post's comments count."
                },
                {
                    path: "/api/posts/:targetId/likes",
                    method: "POST",
                    desc: "Toggle interaction state (Like/Love/Haha etc) for any post or comment.",
                    isProtected: true,
                    mainTable: "likes",
                    requiredFields: ["targetType"],
                    sideEffects: "Automated count updates on target entry and multi-reaction tracking.",
                    body: {
                        targetType: "Post",
                        reactionType: "Love"
                    }
                },
                {
                    path: "/api/posts/:targetId/likes",
                    method: "GET",
                    desc: "Retrieve a complete list of users who reacted to a post or comment.",
                    isProtected: true,
                    mainTable: "likes",
                    requiredFields: ["targetId"],
                    sideEffects: "Calculates metric counts grouped by reactionType."
                }
            ]
        },
        {
            group: "System Infrastructure",
            items: [
                {
                    path: "/api/health",
                    method: "GET",
                    desc: "Check core service status including DB and server uptime.",
                    isProtected: false,
                    mainTable: "infra",
                    requiredFields: [],
                    sideEffects: "Verifies DB connection status."
                },
                {
                    path: "/",
                    method: "GET",
                    desc: "Base index welcome message.",
                    isProtected: false,
                    mainTable: "app",
                    requiredFields: [],
                    sideEffects: "None"
                }
            ]
        }
    ]
};
