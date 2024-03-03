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
      url: null, // URL to the documentation page for this rule
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

        // const getFilename = context.getFilename();
        // if (
        // 	getFilename ===
        // 	'/Users/nikita/WebstormProjects/torgbox/time-zone-clocks/src/stories/Button.tsx'
        // 	) {

        // const firstLines = sourceCode.getLines().map((line) => line.split('\n')[0]);
        // console.log('firstLines', firstLines);

        // console.log('sourceCode.getLines()', sourceCode.getLines()[7].charCodeAt(0));

        //нужно пробежаться по линиям до линии где заканчивабтся импорты и если в начале есть табы то emptySpace = 	'tab'
        //charCode === 9 tab
        //charCode === 32 space


        // Учесть табы, оставить определение количества отступов только 1 раз
        //вставить 1 пробел между from и путем

        const importNode = tokenBefore(node.source, 1);
        const fromNode = tokenBefore(node.source);

        const arraysOfRangeBetweenNodes = (firstNode, secondNode) => [
          firstNode.range[1], secondNode.range[0]
        ];

        const startPositionOfFromNode = tokenBefore(node.source)?.loc?.start?.column;
        const startPositionOfImportNode = tokenBefore(node.source, 1)?.loc?.end?.column;

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
