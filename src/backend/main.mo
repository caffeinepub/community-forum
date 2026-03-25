import List "mo:core/List";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Nat64 "mo:core/Nat64";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // ******************** Type Definitions ********************
  module ForumCategory {
    public type Id = Nat64;
    public type ForumCategory = {
      id : Id;
      name : Text;
      description : Text;
      postCount : Nat;
    };

    public func compare(cat1 : ForumCategory, cat2 : ForumCategory) : Order.Order {
      Text.compare(cat1.name, cat2.name);
    };

    public func compareById(cat1 : ForumCategory, cat2 : ForumCategory) : Order.Order {
      Nat64.compare(cat1.id, cat2.id);
    };
  };

  module Thread {
    public type Id = Nat64;
    public type Thread = {
      id : Id;
      title : Text;
      body : Text;
      author : Principal;
      timestamp : Time.Time;
      replyCount : Nat;
      upvotes : Nat;
      categoryId : ForumCategory.Id;
    };
    public func compare(thread1 : Thread, thread2 : Thread) : Order.Order {
      Text.compare(thread1.title, thread2.title);
    };

    public func compareById(thread1 : Thread, thread2 : Thread) : Order.Order {
      Nat64.compare(thread1.id, thread2.id);
    };
  };

  module Post {
    public type Id = Nat64;
    public type Post = {
      id : Id;
      threadId : Thread.Id;
      body : Text;
      author : Principal;
      timestamp : Time.Time;
    };
    public func compare(post1 : Post, post2 : Post) : Order.Order {
      Nat64.compare(post1.id, post2.id);
    };
  };

  public type UserProfile = {
    name : Text;
  };

  // ******************** State Management ********************
  var nextCategoryId : ForumCategory.Id = 1;
  var nextThreadId : Thread.Id = 1;
  var nextPostId : Post.Id = 1;

  let forumCategories = Map.empty<ForumCategory.Id, ForumCategory.ForumCategory>();
  let threads = Map.empty<Thread.Id, Thread.Thread>();
  let posts = Map.empty<Post.Id, Post.Post>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // ******************** Authorization/Authentication ********************
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ******************** Sample Data Seeding ********************
  system func preupgrade() {};
  system func postupgrade() {
    // Seed default categories (if map is empty)
    if (forumCategories.size() == 0) {
      let categories : [ForumCategory.ForumCategory] = [
        {
          id = 1;
          name = "General";
          description = "General discussions";
          postCount = 0;
        },
        {
          id = 2;
          name = "Technology";
          description = "Tech discussions";
          postCount = 0;
        },
        {
          id = 3;
          name = "Off-Topic";
          description = "Anything goes";
          postCount = 0;
        },
      ];

      for (category in categories.values()) {
        forumCategories.add(category.id, category);
        nextCategoryId += 1;
      };
    };
  };

  // ******************** User Profile Management ********************
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ******************** Helper Functions ********************
  func getCategory(categoryId : ForumCategory.Id) : ForumCategory.ForumCategory {
    switch (forumCategories.get(categoryId)) {
      case (null) { Runtime.trap("Category does not exist!") };
      case (?category) { category };
    };
  };

  func getThread(threadId : Thread.Id) : Thread.Thread {
    switch (threads.get(threadId)) {
      case (null) { Runtime.trap("Thread does not exist!") };
      case (?thread) { thread };
    };
  };

  func filterArray<Elem>(
    array : [Elem],
    predicate : (Elem) -> Bool,
  ) : [Elem] {
    List.fromArray(array).filter(predicate).toArray();
  };

  // ******************** Category Management ********************
  public shared ({ caller }) func createCategory(name : Text, description : Text) : async ForumCategory.ForumCategory {
    // Admin-only function. Fails for non-admins.
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create categories");
    };

    let category : ForumCategory.ForumCategory = {
      id = nextCategoryId;
      name;
      description;
      postCount = 0;
    };

    forumCategories.add(nextCategoryId, category);
    nextCategoryId += 1;
    category;
  };

  public query func listCategories() : async [ForumCategory.ForumCategory] {
    forumCategories.values().toArray().sort();
  };

  // ******************** Thread Management ********************
  public shared ({ caller }) func createThread(title : Text, body : Text, categoryId : ForumCategory.Id) : async Thread.Thread {
    // User-only function. Fails for non-users.
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create threads");
    };

    let category = getCategory(categoryId);

    let thread : Thread.Thread = {
      id = nextThreadId;
      title;
      body;
      author = caller;
      timestamp = Time.now();
      replyCount = 0;
      upvotes = 0;
      categoryId;
    };

    threads.add(nextThreadId, thread);
    nextThreadId += 1;

    // Update category post count
    let updatedCategory = {
      category with
      postCount = category.postCount + 1;
    };
    forumCategories.add(categoryId, updatedCategory);

    thread;
  };

  public query func listThreadsByCategory(categoryId : ForumCategory.Id) : async [Thread.Thread] {
    threads.values().toArray().filter(
      func(thread) {
        thread.categoryId == categoryId;
      }
    ).sort();
  };

  // ******************** Post/Reply Management ********************
  public shared ({ caller }) func createPost(threadId : Thread.Id, body : Text) : async Post.Post {
    // User-only function. Fails for non-users.
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };

    let thread = getThread(threadId);

    let post : Post.Post = {
      id = nextPostId;
      threadId;
      body;
      author = caller;
      timestamp = Time.now();
    };

    posts.add(nextPostId, post);
    nextPostId += 1;

    // Update thread reply count
    let updatedThread = {
      thread with
      replyCount = thread.replyCount + 1;
    };
    threads.add(threadId, updatedThread);

    post;
  };

  public query func getThreadWithPosts(threadId : Thread.Id) : async {
    thread : Thread.Thread;
    posts : [Post.Post];
  } {
    let thread = getThread(threadId);
    let threadPosts = posts.values().toArray().filter(
      func(post) {
        post.threadId == threadId;
      }
    );
    {
      thread;
      posts = threadPosts;
    };
  };

  public query func getThreadDetail(threadId : Thread.Id) : async Thread.Thread {
    getThread(threadId);
  };

  // ******************** Thread Upvoting ********************
  public shared ({ caller }) func upvoteThread(threadId : Thread.Id) : async () {
    // User-only function. Fails for non-users.
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upvote threads");
    };

    let thread = getThread(threadId);
    let updatedThread = {
      thread with
      upvotes = thread.upvotes + 1;
    };
    threads.add(threadId, updatedThread);
  };
};
