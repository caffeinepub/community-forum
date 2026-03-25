# Community Forum

## Current State
New project with empty backend and default frontend scaffold.

## Requested Changes (Diff)

### Add
- Forum categories (e.g. General, Tech, Off-Topic)
- Threads: create, list by category, view individual thread
- Posts/replies: create reply, list replies in a thread
- User authentication: login/logout, identity tied to posts
- Voting (upvote) on threads
- Thread metadata: author, timestamp, reply count, view count

### Modify
- Replace default frontend with forum UI

### Remove
- Default scaffold content

## Implementation Plan
1. Backend: categories, threads, posts data models with CRUD queries/mutations
2. Authorization component for user identity
3. Frontend: Home (category list), Category page (thread list), Thread page (post list + reply form), New Thread form, Nav bar with login
