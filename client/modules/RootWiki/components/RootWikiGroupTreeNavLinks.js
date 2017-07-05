import React from "react";
import { List, Map } from "immutable";
import { shouldComponentUpdate } from "react-immutable-render-mixin";
import { Link } from "react-router";
import pathToRootWikiGroupTree from "../utils/pathToRootWikiGroupTree";
import getRootWikiHref from "../utils/getRootWikiHref";
import getWikisHref from "../utils/getWikisHref";

export function getRootWikiGroupTreeNavLinksHelper(
  rootWikiGroupTree,
  path = [],
  getHrefFunc = () => "",
  hrefs = []
) {
  if (Map.isMap(rootWikiGroupTree)) {
    return rootWikiGroupTree
      .map((node, k) => {
        const finalPath = path.concat(k);
        const href = getHrefFunc(pathToRootWikiGroupTree(finalPath, false));
        const newHrefs = hrefs.concat([[k, href]]);
        return getRootWikiGroupTreeNavLinksHelper(
          node,
          finalPath,
          getHrefFunc,
          newHrefs
        );
      })
      .toList()
      .flatten(1);
  } else if (List.isList(rootWikiGroupTree)) {
    return rootWikiGroupTree.map(leaf => {
      const finalPath = path.concat(leaf);
      const href = getHrefFunc(pathToRootWikiGroupTree(finalPath, true));
      const newHrefs = hrefs.concat([[leaf, href]]);
      return newHrefs;
    });
  } else {
    return null;
  }
}

export function getRootWikiGroupTreeNavLinks(
  rootWikiGroupTree,
  getHrefFunc = () => ""
) {
  return getRootWikiGroupTreeNavLinksHelper(
    rootWikiGroupTree,
    undefined,
    getHrefFunc
  ).toJS();
}

const delimeterStyle = {
  marginLeft: 5,
  marginRight: 5
};
const Delimeter = props => {
  const delimeter = props.delimeter || ">";
  return (
    <span style={delimeterStyle} {...props}>
      {delimeter}
    </span>
  );
};

class RootWikiGroupTreeNavLinks extends React.Component {
  static defaultProps = {
    rootWikiId: "",
    rootStyle: {},
    navLinkStyle: {},
    rootWikiGroupTree: null
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
      const href = this.getWikisHref("null");
      return <Link to={href}>未分類</Link>;
    }
    // /forumBoards/:forumBoardId/rootWikis/:rootWikiId/wikis
    const navLinks = getRootWikiGroupTreeNavLinks(
      rootWikiGroupTree,
      this.getWikisHref
    );
    return (
      <span>
        {navLinks.map((line, lineIndex) => {
          const lineDOM = line.map(([name, href], index, array) => {
            const link = (
              <Link to={href} key={href}>
                {name}
              </Link>
            );
            let delimeter;
            if (index + 1 === array.length) {
              delimeter = null;
            } else {
              delimeter = <Delimeter key={`delimter/${href}`} />;
            }
            return [link, delimeter];
          });
          let _lineDOM;
          if (lineIndex + 1 === navLinks.length) {
            _lineDOM = [lineDOM];
          } else {
            _lineDOM = [lineDOM, <br />];
          }
          return _lineDOM;
        })}
      </span>
    );
  }
}

export default RootWikiGroupTreeNavLinks;
