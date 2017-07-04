import React from 'react';
import {Set} from 'immutable';
import {shouldComponentUpdate} from 'react-immutable-render-mixin';
import Divider from 'material-ui/Divider';
import Avatar from 'material-ui/Avatar';
import GuestPersonIcon from 'material-ui/svg-icons/social/person';
import Toggle from 'material-ui/Toggle';
import Editor from '../../../components/Slate/Editor';
import CenterCircularProgress from '../../../components/CenterCircularProgress';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';

class DiscussionCard extends React.Component {
  static defaultProps = {
    forumBoardId: '',
    forumBoard: null,
    parentDiscussionId: '',
    parentDiscussion: null,
    childrenDiscussions: Set(),
    semanticReplaceMode: false,
    onSemanticToggle: null
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
    this.state = {
      semanticReplaceMode: false,
      semanticReplaceToggled: false
    };
  }

  render() {
    return (
      <Card>
        <CardHeader
          title="Without Avatar"
          subtitle="Subtitle"
          actAsExpander={true}
          showExpandableButton={true}/>
        <CardActions>
          <FlatButton label="Action1"/>
          <FlatButton label="Action2"/>
        </CardActions>
        <CardText expandable={true}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec mattis pretium massa. Aliquam erat
          volutpat. Nulla facilisi. Donec vulputate interdum sollicitudin. Nunc lacinia auctor quam sed
          pellentesque. Aliquam dui mauris, mattis quis lacus id, pellentesque lobortis odio.
        </CardText>
      </Card>
    );
  }
}

export default DiscussionCard;
