# Data Structure

This page outlines the data collections used and their structure.

---
## Group
Represents a collection (i.e. group) of users. A group may participate in multiple discussions together.

```
{
    _id: String,
    members: [String],
    discussions: [String],
    createdAt: Date,
}
```

`_id`: *The unique indentifier for the group within this collection.*

`members`: *Array of user_id's, each corresponding to an entry in the Users collection.*

`discussions`: *Array of discussion_ids, each corresponding to an entry in the Discussions collection.*

`createdAt`: *ISODate object, representing the UTC time this group was created at.*

---
## User
Represents a user of the system. This stores objects created by the Meteor `accounts-password` package, and extends it to store additional information, such as demographic information, and user performance metrics.
```
{
    _id: String,
    createdAt: Date,
    services: {
        password: {
            bcrypt: String,
        },
        email: {
            verificationTokens: []
        },
        resume: {
            loginTokens: []
        }
    },
    username: String,
    emails: [
        {
            address: String,
            verified: Boolean,
        }
    ],
    avatar: String?
}
```

`_id`: *The unique identifier for this user.*

`createdAt`: *ISODate object, representing the UTC time this user object was created at.*

`services`: *A collection of different authentication services through which this user account may be authenticated. Also stores session tokens for this user.*

`username`: *The users username / display name.*

`emails`: *Array of email addresses associated with this user.*

`avatar`: *String containing the base-64 encoded image to be used for the users avatar **(Optional- /public/avatar_default.png is used if not supplied).***

---
## Discussion
Represents a discussion thread. A discussion is a conversation between a group of users, about a given scenario.

```
{
    _id: String,
    createdAt: Date,
    groupId: String,
    activeReplies: [
        {
            userId: String,
            parentId: String,
        },
    ],
    userStars: [
        {
            userId: String,
            commentId: String,
        },
    ],
    actionStar: [
        {
            userId: String,
            commentId: String,
            dateTime: Date,
        },
    ],
    actionReply: [
        {
            userId: String,
            parentId: String?,
            dateTime: Date,
        },
    ],
    actionCollapse: [
        {
            userId: String,
            commentId: String,
            collapsed: Boolean,
            dateTime: Date,
        },
    ],
    votes: [String],
    activeVote: String?,
}
```

`_id`: *The unique identifier for this discussion.*

`createdAt`: *ISODate object representing the UTC time at which this discussion thread was created.*

`groupId`: *String which identifies the group which is participating in this discussion.*

`activeReplies`: *Stores which replies are currently being replied to (and by which users). `parentId` may be an empty string, representing a root level comment is being made. This is used to store the current state of new posts/replies—there should only be one entry for each `userId`.*

`userStars`: *Stores which comments are currently starred (and by which users). Each user can only have one comment starred at a time, and therefore there should only be one entry for each `userId`.*

`actionStar`: *Stores the full history of every star action made on this discussion thread. A star action consists of the `userId` who made the action, the `commentId` of the starred comment (not defined in the case of un-starring), and the `dateTime` the action was made at*.

`actionReply`: *Stores the full history of every active reply made by the user. A reply action consists of the `userId` who made the action, the `parentId` of the comment being replied to (an empty string represents a root-level comment, and undefined represents the reply window being closed), and the `dateTime` the action was made at.*

`actionCollapse`: *Stores the full history of every comment that was collapsed/uncollapsed by a user participating in this discussion. Consists of the `userId` making the action, the `commentId` being collapsed, a boolean (`collapsed`) specifying whether the action was collapsing or uncollapsing the comment, and the `dateTime` at which the action was made. **Note: State of which users currently have a comment collapsed is stored on the comment itself.***

`votes`: *Stores a collection of votes made within this discussion. Each item in this collection is a string, which uniquely identifies an entry in the Votes collection. More detail about the vote may be found there.*

`activeVote`: *The currently active vote for this discussion. Undefined if/when no active vote is taking place.*

---
## Scenario
Represents a scenario, or a starting point for a discussion. 

```
    TODO: implement Scenario collection
```

---
## Comments
Represents a single post within a discussion thread. May be posted at the root level or in response to another comment within the discussion thread.

```
{
    _id: String,
    discussionId: String,
    parentId: String,
    postedTime: Date,
    authorId: String,
    text: String,
    collapsedBy: [String],
}
```

`_id`: *The unique identifier for this comment.*

`discussionId`: *Uniquely identifies the entry in the Discussions collection, to which this comment belongs.*

`parentId`: *Uniquely identifies another entry within the Comments collection, to which this comment is a reply to. This field may also be an empty string, representing comments which are posted at the root-level.*

`postedTime`: *ISODate object representing the UTC time when this comment was posted.*

`authorId`: *Stores the unique identifier for the user who posted this comment.*

`text`: *Stores the text/content of this comment. **Note: maximum length can be configured within `/imports/api/Comments.js`, currently set to 280 characters.***

`collapsedBy`: *A collection of user id's who currently have this comment collapsed.*

---
## Vote
Represents a vote. Users may call for a vote upon comments they have starred, and if successful, the discussion is concluded.

```
{
    _id: String,
    commentId: String,
    discussionId: String,
    userVotes: [
        {
            userId: String,
            vote: Boolean,
        },
    ],
    callerId: String,
    starredBy: [String],
    dateTime: Date,
}
```

`_id`: *Uniquely identifies this vote.*

`commentId`: *Identifies the comment which this vote was called upon.*

`discussionId`: *Identifies the discussion which this vote (and associated comment) exist within.*

`userVotes`: *Array storing the user votes that have been made upon this collection. Each entry consists of the `userId` making the vote, and a boolean `vote` (true=agree, false=disagree) they made.*

`callerId`: *Stores the id of the user who called the vote.*

`starredBy`: *A collection containing the ids of the users who had this comment starred at the time when a vote was called.*

`calledAt`: *ISODate object storing the UTC time when this vote was called.*

---
