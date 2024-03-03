/**
 * @fileoverview Vertical straight align for imports
 * @author Nikita
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description: 'straight indents for imports',
      recommended: false,
      url: 'https://github.com/TrNikita/eslint-plugin-vertical-straight-align'
    },
    fixable: 'whitespace',
    schema: [],
  },

  create(context) {
    const sourceCode = context.getSourceCode();

    function tokenBefore(_node, skip = 0) {
      return sourceCode.getTokenBefore(_node, { skip });
    }

    let isFirstNodeVisited = true;

    let numberOfMaxColumn;

    return {
      ImportDeclaration(node) {
        if (!node.specifiers.length) {
          return;
        }

        if (isFirstNodeVisited) {
          const nodeParent = node.parent.body;

          const nodesOfImports = nodeParent
            .filter(node => node.type === 'ImportDeclaration')
            .map(node => {
              if (tokenBefore(node.source)?.type !== 'Identifier') {
                return tokenBefore(node.source);
              }
              return tokenBefore(node.source, 1)
            });

          if (nodesOfImports.length === 0) {
            return;
          }

          const maxEndColumn = (nodes) => nodes.reduce((maxColumn, node) => {
            return node?.loc.end.column > maxColumn ? node?.loc.end.column : maxColumn
          }, 0);

          const NUMBER_OF_SPACES_AFTER_IMPORT = 1;

          numberOfMaxColumn = maxEndColumn(nodesOfImports) + NUMBER_OF_SPACES_AFTER_IMPORT;
          isFirstNodeVisited = false;
        }

        if (!numberOfMaxColumn) {
          return;
        }

        const importNode = tokenBefore(node.source, 1) || [];
        const fromNode = tokenBefore(node.source) || [];

        const arraysOfRangeBetweenNodes = (firstNode, secondNode) => [
          firstNode.range[1], secondNode.range[0]
        ];

        const startPositionOfFromNode = tokenBefore(node.source)?.loc?.start?.column;
        const startPositionOfImportNode = tokenBefore(node.source, 1)?.loc?.end?.column || 0;

        if (!startPositionOfFromNode) {
          return;
        }

        if (numberOfMaxColumn !== startPositionOfFromNode) {
          context.report({
            node: node,
            message: 'Incorrect number of indents in imports',
            fix(fixer) {
              return fixer.replaceTextRange(
                arraysOfRangeBetweenNodes(importNode, fromNode),
                ' '.repeat(numberOfMaxColumn - startPositionOfImportNode)
              )
            }
          });
        }
        // }
      },
    };
  },
};
