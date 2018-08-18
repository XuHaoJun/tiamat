import { connect } from 'react-redux';
import { PREFIX_STORE_KEY } from './store';

function connectExtendedHelper(storeKey) {
  function connectExtended(mapStateToProps, mapDispatchToProps, mergeProps, _options = {}) {
    const options = Object.assign({}, _options, {
      storeKey: storeKey || PREFIX_STORE_KEY,
    });
    return connect(
      mapStateToProps,
      mapDispatchToProps,
      mergeProps,
      options
    );
  }
  return connectExtended;
}

export { connectExtendedHelper as default };
