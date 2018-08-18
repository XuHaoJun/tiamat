import React from 'react';
import { connect } from 'react-redux';
import LazyLoad from 'react-lazyload';
import MobileDetect from 'mobile-detect';
import { getUserAgent } from '../../modules/UserAgent/UserAgentReducer';
import Loading from './Loading';

export function getStyles() {
  const styles = {
    img: {
      visibility: 'visible',
      opacity: 1,
      transition: 'visibility 0s linear 0s,opacity .4s 0s',
    },
  };
  return styles;
}

class Img extends React.PureComponent {
  static defaultProps = {
    style: {},
    src: '',
    alt: '',
    size: 60,
    userAgent: '',
  };

  renderImg = () => {
    const { style, src, alt, userAgent, size, dispatch, ...other } = this.props;
    const styles = getStyles();
    const finalStyle = Object.assign({}, styles.img, style);
    return <img style={finalStyle} src={src} alt={alt} {...other} />;
  };

  render() {
    const { size, userAgent } = this.props;
    const mobileDetect = new MobileDetect(userAgent);
    if (mobileDetect.is('bot')) {
      return this.renderImg();
    } else {
      const placeholder = <Loading size={size} />;
      return (
        <LazyLoad
          height={size}
          once={true}
          debounce={false}
          throttle={300}
          offset={30}
          placeholder={placeholder}
        >
          {this.renderImg()}
        </LazyLoad>
      );
    }
  }
}

function mapStateToProps(store) {
  return { userAgent: getUserAgent(store) };
}

export default connect(mapStateToProps)(Img);

const ImgWithoutConnect = Img;

export { ImgWithoutConnect };
