import React from 'react';
import PropTypes from 'prop-types';
import isUrl from 'is-url';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import PhotoIcon from 'material-ui/svg-icons/image/photo-camera';
import TextField from 'material-ui/TextField';
import LinearProgress from 'material-ui/LinearProgress';

const styles = {
  imgContainer: {
    maxHeight: '50vh',
    maxWidth: '100%',
    overflow: 'auto'
  },
  img: {
    maxWidth: '100%'
  },
  uploadButton: {
    verticalAlign: 'middle'
  },
  uploadInput: {
    cursor: 'pointer',
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    width: '100%',
    opacity: 0
  },
  button: {
    marginTop: 5
  },
  urlTextField: {
    marginLeft: 5
  }
};

class AddImageDialog extends React.PureComponent {
  static propTypes = {
    open: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    sendAddImage: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func
  };

  static defaultProps = {
    open: false,
    title: '新增圖片',
    sendAddImage: null,
    onRequestClose: null
  };

  constructor(props) {
    super(props);
    this.state = {
      imageUrl: '',
      previewImageUrl: '',
      urlTextFieldValue: '',
      progressValue: 0,
      uploading: false
    };
    this.onRequestClose = this
      .onRequestClose
      .bind(this);
  }

  onRequestClose(e, reason) {
    if (this.props.onRequestClose) {
      this
        .props
        .onRequestClose(e, reason, this);
    }
  }

  handleCancel = (e) => {
    e.preventDefault();
    const reason = {
      action: 'cancel'
    };
    this.setState({
      imageUrl: '',
      previewImageUrl: '',
      urlTextFieldValue: ''
    }, this.onRequestClose.bind(this, e, reason));
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const {imageUrl} = this.state;
    const action = 'submit';
    const payload = {
      url: imageUrl
    };
    const reason = {
      action,
      payload
    };
    this.setState({
      imageUrl: '',
      previewImageUrl: '',
      urlTextFieldValue: ''
    }, this.onRequestClose.bind(this, e, reason));
  };

  handleFileInputChange = (e) => {
    e.preventDefault();
    // TODO support files
    const file = e.target.files[0];
    const reader = new FileReader();
    const [type] = file
      .type
      .split('/');
    if (type === 'image') {
      const onLoadFile = () => {
        const dataUrl = reader.result;
        const nextState = {
          uploading: true,
          previewImageUrl: dataUrl,
          imageUrl: '',
          progressValue: 0
        };
        this.setState(nextState);
        const dataUrlWithoutHeading = dataUrl.replace(/^data:image\/(.+);base64,/, '');
        const form = {
          type: 'base64',
          image: dataUrlWithoutHeading
        };
        const {sendAddImage} = this.props;
        if (sendAddImage) {
          const onProgress = this._defaultOnProgress;
          const reqOpts = {
            onUploadProgress: onProgress,
            onDownloadProgress: onProgress
          };
          sendAddImage(form, reqOpts).then((imageJSON) => {
            this.setState({imageUrl: imageJSON.url, uploading: false, progressValue: 0});
          }).catch(() => {
            this.setState({imageUrl: '', uploading: false, progressValue: 0});
          });
        }
      };
      reader.addEventListener('load', onLoadFile);
      reader.readAsDataURL(file);
    }
  };

  _defaultOnProgress = (progressEvent) => {
    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    const {progressValue} = this.state;
    const nextProgressValue = progressValue + percentCompleted;
    this.setState({progressValue: nextProgressValue});
  };

  handleUrlTextFieldChange = (e) => {
    const urlTextFieldValue = e.target.value;
    const nextState = {
      urlTextFieldValue
    };
    if (isUrl(urlTextFieldValue)) {
      nextState.previewImageUrl = urlTextFieldValue;
      const {sendAddImage} = this.props;
      if (sendAddImage) {
        nextState.uploading = true;
        nextState.imageUrl = '';
        nextState.progressValue = 0;
        const form = {
          type: 'url',
          image: urlTextFieldValue
        };
        const onProgress = this._defaultOnProgress;
        const reqOpts = {
          onUploadProgress: onProgress,
          onDownloadProgress: onProgress
        };
        sendAddImage(form, reqOpts).then((imageJSON) => {
          this.setState({imageUrl: imageJSON.url, uploading: false, progressValue: 0});
        }).catch(() => {
          this.setState({imageUrl: '', uploading: false, progressValue: 0});
        });
      }
    } else {
      nextState.previewImageUrl = '';
      nextState.imageUrl = '';
    }
    this.setState(nextState);
  };

  render() {
    const {title, open} = this.props;
    const {imageUrl, previewImageUrl, uploading, progressValue} = this.state;
    const confirmDisabled = imageUrl === '';
    const actions = [
      <FlatButton label="取消" onTouchTap={this.handleCancel}/>,
      <RaisedButton label="確定" disabled={confirmDisabled} primary={true} onTouchTap={this.handleSubmit}/>
    ];
    return (
      <Dialog title={title} actions={actions} modal={true} open={open} autoScrollBodyContent={true}>
        <FlatButton
          disabled={uploading}
          label="選擇檔案"
          labelPosition="before"
          style={styles.uploadButton}
          containerElement="label"
          icon={< PhotoIcon />}>
          <input
            type="file"
            style={styles.uploadInput}
            accept="image/*"
            onChange={this.handleFileInputChange}/>
        </FlatButton>
        <br/>
        <TextField
          style={styles.urlTextField}
          floatingLabelText="圖片網址..."
          value={this.state.urlTextFieldValue}
          disabled={uploading}
          onChange={this.handleUrlTextFieldChange}/>
        <div style={styles.imgContainer}>
          {
            uploading
              ? <LinearProgress mode="determinate" min={0} max={200} value={progressValue}/>
              : null
          }
          {
            previewImageUrl
              ? <img style={styles.img} src={previewImageUrl} alt="previewImage"/>
              : null
          }
        </div>
      </Dialog>
    );
  }
}

export default AddImageDialog;
