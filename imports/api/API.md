# Meteor API
## Meteor Methods
```javascript
'comments.insert'(discussionId: String, parentId: String, text: String)
```
Creates a new entry in the `comments` collection, under the specified discussion with the supplied text. `parentId` should be `''` if the comment is at the root level, otherwise it should be the `commentId` of a comment within the same discussion, which this comment is a reply to.

An error will be thrown if the user is not a member of the supplied discussion, or if the comment text exceeds the maximum length (280 char).

---
```javascript
'comments.collapse'(discussionId: String, commentId: String, collapse: Boolean)
```
Used to collapse and uncollapse (i.e. hide content and replies) the specified comment.

Throws an error if the user is not a member of the specified discussion.

---
```javascript
'comments.generateDiscussion'(discussionId: String, numComments: Number, replyProbability: Number)
```
Used to generate a sample discussion using filler text, with the specified number of comments. The `replyProbability` must be a number in the range [0,1], and determines the shape of the discussion (a value of 0 results in all comments at root level, whereas a value of 1 results in a single chain of replies).

Throws an error if the user is not an admin, and a member of the specified discussion.

---
```javascript
'groups.create'(members: Array<String>, scenarioSetId: String, options: Object?)
```
Creates a new group, with the supplied `members` array of userId's as members of the group. The supplied `scenarioSetId` specifies the collection of discussions that this group shall discuss.

The (optional) `options` parameter may contain additional configuration information, including:

- `commentLengthLimit`: The maximum number of characters, including markdown, that may be included in a single comment. If this is not supplied, the default value will be used.
- `maxDiscussionDuration`: The maximum duration, specified in milliseconds, for discussions created under this group. After the specified amount of time has passed, if the discussion has not yet finished a 'hung jury' is declared and the discussion is ended. If not specified, there is no limit on the duration of discussions.

Throws error if user calling this method does not have required permissions (i.e. `admin` or `create-group` role)

---
```javascript
'comments.star'(discussionId: String, commentId: String)
```
Marks the specified comment as starred within the current discussion. As each user may only have one comment per discussion starred at a time, any previously starred comments will be unstarred.

An error will be thrown if the user is not a member of the specified discussion, or if the discussion is not in the active state.

---
```javascript
'comments.unstar'(discussionId: String, commentId: String)
```
Unstars the specified comment in the specified discussion.

Throws an error if the user is not a member of the specified discussion, or if the discussion is not in the active state.

---
```javascript
'comments.reply'(discussionId: String, parentId: String)
```
Marks the current user as replying to the specified comment. This information is used to display which users are actively replying to other comments, as well as rendering the comment-posting form on the users client. If `parentId` is `''` (denoting a root-level comment in progress), the information is stored on the discussion object. Otherwise, the information is stored on the comment to which `parentId` refers to.

Throws an error if the user is not a member of the specified discussion, or if the discussion is not in the active state.

---
```javascript
'comments.closeReply'(discussionId: String, parentId: String)
```
Signifies that the user has closed the reply form for the specified comment in the specified discussion. If `parentId` is `''`, this method removes the user from the `activeReplies` field of the related discussion object. Otherwise, the user is removed from the `activeReplies` field of the comment corresponding to the specified `parentId`.

Throws an error if the user is not a member of the specified discussion, or if the discussion is not in the active state.

---
```javascript
'votes.callVote'(discussionId: String, commentId: String)
```
Used to start a vote on the specified comment within the specified discussion.

Throws an error if:
  - The user is not a member of the specified discussion
  - The user does not have the comment starred
  - The comment has already been voted upon
  - The discussion is not in the active state (i.e., a vote is already in progress, or the discussion has finished)

---
```javascript
'votes.vote'(voteId: String, userVote: Boolean)
```
Marks the user's vote (either `true` to agree, or `false` to disagree) for the specified vote.

Each time this method is called, it checks whether the other members of the group have casted their vote. Upon the last member casting their vote, the vote will be closed. If the vote was successful (all members agree), then the discussion will be marked as finished, and the next discussion created.

Throws an error if:
  - The specified `voteId` does not exist
  - The vote is not the active vote for this discussion
  - The user is not a member of the group participating in this discussion

---
```javascript
'scenarios.create'(topicId: String, title: String, description: String)
```
Creates a new scenario under the specified topic, with the supplied `title` and `description`.

Throws an error if the user does not have the required permissions (`admin` or `create-scenario` role).

---
```javascript
'scenarioSets.create'(title: String, description: String, scenarios: Array<String>, ordered: Boolean)
```
Creates a new set of scenarios, with the supplied `title`, `description`, and set of scenario ids supplied in the `scenarios` array. The contents of this array should be valid scenario id's, that are in the active state.

Throws an error if the user does not have the required permissions (`admin` or `create-scenario-set` role).

---
```javascript
'users.updateProfile'(avatar: String)
```
// TODO: update this method to store user demographic information
Sets the users avatar to the supplied `avatar` value (may be a url or a base64-encoded image).

---
```javascript
'users.enrolNewUser'(emailAddress: String)
```
Creates a new user and returns the associated `userId`. An email is sent to the supplied email address, inviting them to join the site.

Throws an error if the calling user does not have the admin role.

---
```javascript
'users.doesUsernameExist'(username: String)
```
Used to check whether the supplied username is valid or not.

Returns true if there exists another user with the username, and false if the username is unused.

---
```javascript
'users.getFromResetToken'(token: String)
```
Finds and returns the user object for the supplied reset/enrollment token.
The returned object exposes only the `_id` and `emails` fields from the user object.

Throws an error if no user was found for the supplied token, or if the token has expired.

---
```javascript
'users.setUsernameOnEnroll'(token: String, username: String)
```
Sets the username for the user associated with the specified enrollment token.

Throws an error if the token is invalid, expired, or not an enrollment token.

---
```javascript
'users.getMembersOfGroup'(groupId: String)
```
Returns an array containing the members of the specified group.

Only the `username` and `avatar` fields of the user objects are contained in the array.

---
```javascript
'users.getMembersOfDiscussion'(discussionId: String)
```
Returns an array containing the members of the group having the specified discussion.

Only the `username` and `avatar` fields of the user objects are contained in the array.

---
```javascript
'users.getProfile'(userId: String)
```
Returns the user object for the requested userId. The fields included in the result are only those made public by the specified user.

---
```javascript
'roles.setAdmin'(userIds: String | Array<String>)
```
Adds the `admin` role to each of the supplied users.

Throws an error if the current user does not have the admin role.

---
```javascript
'roles.setPermission_createScenario'(userIds: String | Array<String>, set: Boolean)
```
Used to add or remove the `'create-scenario'` role from the specified user(s). This role allows users to create new scenarios.

Throws an error if the current user does not have the admin role.

---
```javascript
'roles.setPermission_createScenarioSet'(userIds: String | Array<String>, set: Boolean)
```
Used to add or remove the `'create-scenario-set'` role from the specified user(s). This role allows users to create new sets of scenarios.

Throws an error if the current user does not have the admin role.

---
```javascript
'roles.setPermission_createGroup'(userIds: String | Array<String>, set: Boolean)
```
Used to add or remove the `'create-group' role from the specified user(s). This role allows users to start new 'games', by creating groups of users with an associated scenario set for discussion.

Throws an error if the current user does not have the admin role.

---
## Publications and Subscriptions
---
```javascript
Meteor.subscribe('comments', discussionId);
```
Subscribes to all comments within the specified discussion.

---
```javascript
Meteor.subscribe('groups');
```

---
```javascript
Meteor.subscribe('discussions');
```

---
```javascript
Meteor.subscribe('scenarios');
```

---
```javascript
Meteor.subscribe('scenarioSets');
```

---
```javascript
Meteor.subscribe('topics');
```

---
```javascript
Meteor.subscribe('allUsers');
```
Subscribes to all users registered on the system.

An error will be thrown if the calling user is does not have either the `admin` or `create-group` role.

---
```javascript
Meteor.subscribe('votes', discussionId);
```
Subscribes to all votes associated with the specified discussion.
