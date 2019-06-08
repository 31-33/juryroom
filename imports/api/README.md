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
    created_at: Date,
}
```

`_id`: *The unique indentifier for the group within this collection.*

`members`: *Array of user_id's, each corresponding to an entry in the Users collection.*

`discussions`: *Array of discussion_ids, each corresponding to an entry in the Discussions collection.*

`created_at`: *ISODate object, representing the UTC time this group was created at.*

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
    created_at: Date,
    group_id: String,
    active_replies: [
        {
            user_id: String,
            parent_id: String,
        },
    ],
    user_stars: [
        {
            user_id: String,
            comment_id: String,
        },
    ],
    action_star: [
        {
            user_id: String,
            comment_id: String,
            date_time: Date,
        },
    ],
    action_reply: [
        {
            user_id: String,
            date_time: Date,
            parent_id: String?,
        },
    ],
    action_collapse: [
        {
            user_id: String,
            comment_id: String,
            collapsed: Boolean,
            date_time: Date,
        },
    ],
    votes: [String],
    active_vote: String?,
}
```

`_id`: *The unique identifier for this discussion.*

`created_at`: *ISODate object representing the UTC time at which this discussion thread was created.*

`group_id`: *String which identifies the group which is participating in this discussion.*

`active_replies`: *Stores which replies are currently being replied to (and by which users). `parent_id` may be an empty string, representing a root level comment is being made. This is used to store the current state of new posts/replies—there should only be one entry for each `user_id`.*

`user_stars`: *Stores which comments are currently starred (and by which users). Each user can only have one comment starred at a time, and therefore there should only be one entry for each `user_id`.*

`action_star`: *Stores the full history of every star action made on this discussion thread. A star action consists of the `user_id` who made the action, the `comment_id` of the starred comment (not defined in the case of un-starring), and the `date_time` the action was made at*.

`action_reply`: *Stores the full history of every active reply made by the user. A reply action consists of the `user_id` who made the action, the `parent_id` of the comment being replied to (an empty string represents a root-level comment, and undefined represents the reply window being closed), and the `date_time` the action was made at.*

`action_collapse`: *Stores the full history of every comment that was collapsed/uncollapsed by a user participating in this discussion. Consists of the `user_id` making the action, the `comment_id` being collapsed, a boolean (`collapsed`) specifying whether the action was collapsing or uncollapsing the comment, and the `date_time` at which the action was made. **Note: State of which users currently have a comment collapsed is stored on the comment itself.***

`votes`: *Stores a collection of votes made within this discussion. Each item in this collection is a string, which uniquely identifies an entry in the Votes collection. More detail about the vote may be found there.*

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
    discussion_id: String,
    parent_id: String,
    posted_time: Date,
    author_id: String,
    text: String,
    collapsed: [String],
}
```

`_id`: *The unique identifier for this comment.*

`discussion_id`: *Uniquely identifies the entry in the Discussions collection, to which this comment belongs.*

`parent_id`: *Uniquely identifies another entry within the Comments collection, to which this comment is a reply to. This field may also be an empty string, representing comments which are posted at the root-level.*

`posted_time`: *ISODate object representing the UTC time when this comment was posted.*

`author_id`: *Stores the unique identifier for the user who posted this comment.*

`text`: *Stores the text/content of this comment. **Note: maximum length can be configured within `/imports/api/Comments.js`, currently set to 280 characters.***

`collapsed`: *A collection of user_id's who currently have this comment collapsed.*

---
## Vote
Represents a vote. Users may call for a vote upon comments they have starred, and if successful, the discussion is concluded.

```
{
    _id: String,
    comment_id: String,
    discussion_id: String,
    user_votes: [
        {
            user_id: String,
            vote: Boolean,
        },
    ],
    caller_id: String,
    starred_by: [String],
    date_time: Date,
}
```

`_id`: *Uniquely identifies this vote.*

`comment_id`: *Identifies the comment which this vote was called upon.*

`discussion_id`: *Identifies the discussion which this vote (and associated comment) exist within.*

`user_votes`: *Array storing the user votes that have been made upon this collection. Each entry consists of the `user_id` making the vote, and a boolean `vote` (true=agree, false=disagree) they made.*

`caller_id`: *Stores the id of the user who called the vote.*

`starred_by`: *A collection containing the ids of the users who had this comment starred at the time when a vote was called.*

`date_time`: *ISODate object storing the UTC time when this vote was called.*

---
