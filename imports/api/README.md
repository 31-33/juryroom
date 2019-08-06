# Data Structure

This page outlines the data collections used and their structure.

---
## Group
Represents a collection (i.e. group) of users. A group may participate in multiple discussions together.

```
{
    _id: String,
    members: [String],
    scenarioSetId: String,
    discussions: [String],
    createdAt: Date,
    createdBy: String,
    maxDiscussionDuration: Number?,
}
```

`_id`: *The unique indentifier for the group within this collection.*

`members`: *Array of user id's, each corresponding to an entry in the Users collection.*

`scenarioSetId`: *The set of scenarios that this group is to discuss.*

`discussions`: *Array of objects, each representing a discussion carried out by this group. Each entry in this array stores the `scenarioId` and the `discussionId` for the discussion.*

`createdAt`: *ISODate object, representing the UTC time this group was created at.*

`createdBy`: *The userId of the user who created this group.*

`commentLengthLimit`: *The maximum number of characters that can be in a single comment, for this groups discussions. This value is then copied onto each new discussion as they are created.*

`maxDiscussionDuration`: *The maximum duration of a discussion conducted by this group, `in milliseconds`. If set, this field will be used to apply a deadline to all discussions created under this group.*

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
    scenarioId: String,
    createdAt: Date,
    groupId: String,
    activeReplies: [
        {
            userId: String,
            activeTime: Date,
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
            open: Boolean,
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
    votes: [
        {
            voteId: String,
            commentId: String,
        },
    ],
    activeVote: String?,
    status: String,
    commentLengthLimit: Number,
    deadline: Date?
}
```

`_id`: *The unique identifier for this discussion.*

`scenarioId`: *Identifier for the scenario for this discussion.*

`createdAt`: *ISODate object representing the UTC time at which this discussion thread was created.*

`groupId`: *String which identifies the group which is participating in this discussion.*

`activeReplies`: *Stores which users are currently making root-level comments. The `userId` of each user currently making a comment is stored, along with the time of activity.*

`actionStar`: *Stores the full history of every star action made on this discussion thread. A star action consists of the `userId` who made the action, the `commentId` of the starred comment (not defined in the case of un-starring), and the `dateTime` the action was made at*.

`actionReply`: *Stores the full history of every active reply made by the user. A reply action consists of the `userId` who made the action, the `parentId` of the comment being replied to (an empty string represents a root-level comment), the `dateTime` the action was made at, and a boolean flag `open` denoting whether or not the action was opening or closing the reply window.*

`actionCollapse`: *Stores the full history of every comment that was collapsed/uncollapsed by a user participating in this discussion. Consists of the `userId` making the action, the `commentId` being collapsed, a boolean (`collapsed`) specifying whether the action was collapsing or uncollapsing the comment, and the `dateTime` at which the action was made. **Note: State of which users currently have a comment collapsed is stored on the comment itself.***

`votes`: *Stores a collection of votes made within this discussion. Each entry refers to a separate vote that takes place within this discussion, and includes the `voteId` of the entry in the Votes collection for this vote, and the `commentId` for the comment that was voted upon.*

`activeVote`: *The currently active vote for this discussion. Undefined if/when no active vote is taking place.*

`status`: *String representing the state the discussion is currently in. Possible values are `active` when discussion is in progress, `voting` when a vote is in progress (this should restrict other actions), and `finished` when the discussion is completed.*

`commentLengthLimit`: *The maximum number of characters that a comment on this discussion may contain.*

`deadline`: *If set, the discussion must be finished before the supplied value. If the discussion has not reached a consensus by this time, a hung-jury will be declared, and the discussion will end.*

---
## Topic
Represents a broad category for discussion scenarios (i.e., politics, sport, religion, etc)

```
{
    _id: String,
    title: String,
}
```

`_id`: *The unique identifier for this topic.*

`title`: *The name of this topic.*

---
## Scenario
Represents a scenario, or a starting point for a discussion. 

```
{
    _id: String,
    topicId: String,
    title: String,
    description: String,
    createdAt: Date,
    status: String,
    submittedBy: String,
}
```

`_id`: *The unique identifier for this scenario.*

`topicId`: *The id for the topic that this scenario falls under.*

`title`: *The title for this scenario.*

`description`: *A slightly more detailed description of this scenario.*

`createdAt`: *ISODate object representing the date/time this scenario was submitted at.*

`status`: *The status of this scenario. Expected values are `active` or `pending`.*

`submittedBy`: *The userId of the user who submitted this scenario.*

---
## SecenarioSet
Represents a (potentially ordered) sequence of scenarios. A group participates in a **single** `ScenarioSet`, which is a fixed set of scenarios. A scenario may belong to multiple ScenarioSets.

```
{
    _id: String,
    title: String,
    description: String,
    scenarios: [String],
    ordered: Boolean,
    createdAt: Date,
    status: String,
    submittedBy: String,
}
```

`_id`: *The unique identifier for this set of scenarios. This is the field that is supplied when a new group is created.*

`title`: *The title for this set of scenarios.*

`description`: *A brief description of this scenario-set.*

`scenarios`: *The collection of scenarios that are part of this set. This is stored as an array of scenario ids.*

`ordered`: *Boolean field representing whether or not this scenario set is ordered. If true, groups will proceed through the scenarios in the order of appearance in the `scenarios` field. If false, scenarios will be randomly selected from the remaining list until all have been completed.

`status`: *The status of this scenario-set. Expected values are `active`, `pending`, and `archived`.*

`submittedBy`: *The userId of the user who submitted this ScenarioSet*

---
## Comments
Represents a single post within a discussion thread. May be posted at the root level or in response to another comment within the discussion thread.

```
{
    _id: String,
    discussionId: String,
    parentId: String,
    postedTime: Date,
    activeReplies: [
        {
            userId: String,
            activeTime: Date,
        },
    ],
    userStars: [
        {
            userId: String,
            dateTime: Date,
        },
    ],
    authorId: String,
    text: String,
    collapsedBy: [String],
}
```

`_id`: *The unique identifier for this comment.*

`discussionId`: *Uniquely identifies the entry in the Discussions collection, to which this comment belongs.*

`parentId`: *Uniquely identifies another entry within the Comments collection, to which this comment is a reply to. This field may also be an empty string, representing comments which are posted at the root-level.*

`postedTime`: *ISODate object representing the UTC time when this comment was posted.*

`activeReplies`: *Stores the `userId`'s for the users who are currently replying to this comment.*

`userStars`: *Stores the `userId`s for the users who currently have this comment starred.*

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
    userVotes: {
        (userId: String) : (vote: Boolean?),
    },
    voteArchive: [
        {
            userId: String,
            vote: Boolean,
            voteTime: Date,
        },
    ],
    callerId: String,
    starredBy: [String],
    dateTime: Date,
    finished: Boolean,
}
```

`_id`: *Uniquely identifies this vote.*

`commentId`: *Identifies the comment which this vote was called upon.*

`discussionId`: *Identifies the discussion which this vote (and associated comment) exist within.*

`userVotes`: *A dictionary that stores the current state of user votes on this vote. Initialized with a key for each userId in the group for the associated discussion, with a value of `null`. Value is set to either `true` or `false` when the user makes (or changes) their vote.*

`voteArchive`: *Array storing the full history of user votes that have been made upon this collection. Each entry consists of the `userId` making the vote, a boolean `vote` (true=agree, false=disagree) they made, along with the time the vote was made at.*

`callerId`: *Stores the id of the user who called the vote.*

`starredBy`: *A collection containing the ids of the users who had this comment starred at the time when a vote was called.*

`calledAt`: *ISODate object storing the UTC time when this vote was called.*

`finished`: *Boolean field to track whether this vote has been completed or not. `false` represents an in-progress vote, whereas `true` means the vote has finished (whether successful or not).*

---
