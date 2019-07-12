import React, { PureComponent } from 'react';
import { Container } from 'semantic-ui-react';
import ReactAvatarEditor from 'react-avatar-editor';
import PropTypes from 'prop-types';

class AvatarEditor extends PureComponent {
  static defaultProps = {
    avatar: '/avatar_default.png',
  };

  static propTypes = {
    avatar: PropTypes.string,
  };

  constructor(props) {
    super(props);

    this.state = {
      scale: 1,
      image: props.avatar,
    };
    this.getProfileImage = () => (this.editor
      ? this.editor.getImageScaledToCanvas().toDataURL()
      : '/avatar_default.png');
  }

  componentDidUpdate(prevProps) {
    const { avatar } = this.props;
    if (prevProps.avatar !== avatar) {
      this.updateImage(avatar);
    }
  }

  setEditor = (editor) => {
    this.editor = editor;
  };

  updateImage(img) {
    this.setState({ image: img });
  }

  render() {
    const { image, scale } = this.state;

    return (
      <Container textAlign="center">
        <ReactAvatarEditor
          ref={this.setEditor}
          width={100}
          height={100}
          image={image}
          scale={parseFloat(scale)}
        />
        <div>
          <input type="range" min="0.25" max="4" step="0.05" defaultValue="1" onChange={e => this.setState({ scale: parseFloat(e.target.value) })} />
          <input type="file" onChange={e => this.setState({ image: e.target.files[0] })} />
        </div>
      </Container>
    );
  }
}

export default AvatarEditor;
