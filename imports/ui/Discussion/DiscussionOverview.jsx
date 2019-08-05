import React, { PureComponent } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import {
  AutoSizer, List,
} from 'react-virtualized';
import {
  Container,
} from 'semantic-ui-react';
import Comments from '/imports/api/Comments';
import Votes from '/imports/api/Votes';

const ROW_HEIGHT = 8;

class DiscussionOverview extends PureComponent {
  static propTypes = {
    discussionId: PropTypes.string.isRequired,
    scrollToComment: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      comments: [],
      votes: [],
    };

    this.scrollByPercentage = (percentage) => {
      const { comments } = this.state;
      this.List.scrollToRow(Math.ceil(percentage * comments.length));
    };
  }

  componentDidMount() {
    const { discussionId } = this.props;

    setTimeout(() => {
      this.commentsListener = Comments.find(
        { discussionId },
        {
          fields: {
            postedTime: 1,
            userStars: 1,
            parentId: 1,
          },
          sorted: { postedTime: 1 },
        },
      ).observeChanges({
        added: (id, data) => {
          const { comments } = this.state;
          data._id = id;
          if (data.parentId === '') {
            data.depth = 0;
            comments.push(data);
          } else {
            for (let i = 0; i < comments.length; i += 1) {
              if (!data.depth) {
                if (comments[i]._id === data.parentId) {
                  // Set depth to parent depth + 1
                  data.depth = (comments[i].depth + 1);
                }
              } else if (comments[i].depth < data.depth) {
                // Reached a comment that is not a descendant of our parent
                // Insert this comment before it
                comments.splice(i, 0, data);
                return;
              }
            }
            if (data.depth) {
              // Depth was set, but no non-descendant node was found
              // Insert this comment at the end
              comments.push(data);
            } else {
              console.log(`Parent was not found for node with id ${data._id}.
              Expected parentId: ${data.parentId}`);
            }
          }
          this.setState({ comments }, () => {
            this.List.forceUpdateGrid();
            this.autoSizer.forceUpdate();
          });
        },
        changed: (id, updatedFields) => {
          const { comments } = this.state;
          const index = comments.findIndex(comment => comment._id === id);
          const comment = comments[index];
          Object.keys(updatedFields).forEach((key) => {
            comment[key] = updatedFields[key];
          });
          this.setState({ comments }, () => this.List.forceUpdateGrid());
        },
      });

      this.votesListener = Votes.find(
        { discussionId },
        {
          fields: {
            commentId: 1,
          },
        },
      ).observeChanges({
        added: (id, data) => {
          const { votes } = this.state;
          votes.push(data);
          this.setState({ votes }, () => this.List.forceUpdateGrid());
        },
      });
      this.autoSizer.forceUpdate();
    }, 0);
  }

  componentWillUnmount() {
    if (this.commentsListener) {
      this.commentsListener.stop();
    }
    if (this.votesListener) {
      this.votesListener.stop();
    }
  }

  render() {
    const { scrollToComment } = this.props;
    const { comments, votes } = this.state;

    return (
      <AutoSizer
        style={{
          margin: '0.5em',
        }}
        ref={(ref) => { this.autoSizer = ref; }}
      >
        {({ height, width }) => (
          <List
            height={height - 60}
            width={width}
            rowHeight={ROW_HEIGHT}
            ref={(ref) => { this.List = ref; }}
            style={{ outline: 'none' }}
            rowCount={comments.length}
            rowRenderer={({
              index, key, parent, style,
            }) => {
              const comment = comments[index];

              const isStarred = comment
                && comment.userStars
                && comment.userStars.length > 0;

              const isVoted = votes.some(vote => vote.commentId === comment._id);

              let color = 'black';
              if (isVoted) {
                color = 'green';
              } else if (isStarred) {
                color = 'yellow';
              }

              return (
                <div
                  key={key}
                  parent={parent}
                  style={{
                    paddingLeft: 10 * comment.depth,
                    ...style,
                  }}
                >
                  <Container
                    style={{
                      height: ROW_HEIGHT,
                      backgroundColor: color,
                      border: `${(isVoted || isStarred) ? '1px' : '2px'} solid #DEDEDE`,
                    }}
                    onClick={() => scrollToComment(comment._id)}
                  />
                </div>
              );
            }}
          />
        )}
      </AutoSizer>
    );
  }
}
export default DiscussionOverview;
