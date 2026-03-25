import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Thread {
    id: Id;
    categoryId: Id;
    upvotes: bigint;
    title: string;
    body: string;
    author: Principal;
    timestamp: Time;
    replyCount: bigint;
}
export interface Post {
    id: Id;
    body: string;
    author: Principal;
    timestamp: Time;
    threadId: Id;
}
export type Id = bigint;
export interface ForumCategory {
    id: Id;
    postCount: bigint;
    name: string;
    description: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCategory(name: string, description: string): Promise<ForumCategory>;
    createPost(threadId: Id, body: string): Promise<Post>;
    createThread(title: string, body: string, categoryId: Id): Promise<Thread>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getThreadDetail(threadId: Id): Promise<Thread>;
    getThreadWithPosts(threadId: Id): Promise<{
        thread: Thread;
        posts: Array<Post>;
    }>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listCategories(): Promise<Array<ForumCategory>>;
    listThreadsByCategory(categoryId: Id): Promise<Array<Thread>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    upvoteThread(threadId: Id): Promise<void>;
}
