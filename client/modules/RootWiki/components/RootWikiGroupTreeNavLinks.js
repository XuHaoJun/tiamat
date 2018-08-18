import React from 'react';
import { List, Map } from 'immutable';
import { shouldComponentUpdate } from 'react-immutable-render-mixin';
import { Link } from 'react-router-dom';
import pathToRootWikiGroupTree from '../utils/pathToRootWikiGroupTree';
import getRootWikiHref from '../utils/getRootWikiHref';
import getWikisHref from '../utils/getWikisHref';

function rootWikiGroupTreeToNavLinksHelper(
  rootWikiGroupTree,
  getHrefFunc,
  path = [],
  links = List(),
  leaves = [],
  depth = 0
) {
  if (Map.isMap(rootWikiGroupTree)) {
    const name = rootWikiGroupTree.get('name');
    const children = rootWikiGroupTree.get('children');
    const nextPath = path.concat(name);
    const href = getHrefFunc(pathToRootWikiGroupTree(nextPath));
    const link = Map({ name, href });
    const nextLinks = links.push(link);
    if (children) {
      return rootWikiGroupTreeToNavLinksHelper(
        children,
        getHrefFunc,
        nextPath,
        nextLinks,
        leaves,
        depth + 1
      );
    } else {
      leaves.push(nextLinks);
      return nextLinks;
    }
  } else if (List.isList(rootWikiGroupTree)) {
    rootWikiGroupTree.map(node => {
      return rootWikiGroupTreeToNavLinksHelper(node, getHrefFunc, path, links, leaves, depth);
    });
    return List(leaves);
  }
  return undefined;
}

function rootWikiGroupTreeToNavLinks(rootWikiGroupTree, getHrefFunc = () => '') {
  return rootWikiGroupTreeToNavLinksHelper(rootWikiGroupTree, getHrefFunc);
}

const delimeterStyle = {
  marginLeft: 5,
  marginRight: 5,
};

const Delimeter = props => {
  const delimeter = props.delimeter || '>';
  return (
    <span style={delimeterStyle} {...props}>
      {delimeter}
    </span>
  );
};

class RootWikiGroupTreeNavLinks extends React.Component {
  static defaultProps = {
    rootWikiId: '',
    rootStyle: {},
    navLinkStyle: {},
    rootWikiGroupTree: null,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
  }

  getRootWikiHref = () => {
    const { rootWikiId } = this.props;
    return getRootWikiHref(rootWikiId);
  };

  getWikisHref = rootWikiGroupTree => {
    const prefix = this.getRootWikiHref();
    const wikisHref = getWikisHref(rootWikiGroupTree);
    return `${prefix}${wikisHref}`;
  };

  render() {
    const { rootWikiGroupTree } = this.props;
    if (!rootWikiGroupTree) {
      const href = this.getWikisHref('null');
      return <Link to={href}>未分類</Link>;
    }
    const navLinks = rootWikiGroupTreeToNavLinks(rootWikiGroupTree, this.getWikisHref);
    return (
      <span>
        {navLinks
          .map((line, lineIndex) => {
            const lineDOM = line.map((node, index, array) => {
              const href = node.get('href');
              const name = node.get('name');
              const key = `${lineIndex}/${href}`;
              const link = (
                <Link to={href} key={key}>
                  {name}
                </Link>
              );
              let delimeter;
              if (index + 1 === array.count()) {
                delimeter = null;
              } else {
                const dkey = `${lineIndex}/delimter/${href}`;
                delimeter = <Delimeter key={dkey} />;
              }
              return [link, delimeter];
            });
            let _lineDOM;
            if (lineIndex + 1 === navLinks.count()) {
              _lineDOM = [lineDOM];
            } else {
              const bkey = `${lineIndex}/br`;
              _lineDOM = [lineDOM, <br key={bkey} />];
            }
            return _lineDOM;
          })
          .toJSON()}
      </span>
    );
  }
}

export default RootWikiGroupTreeNavLinks;
