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
    function generateSpaces(a) {
      if (a < 0) {
        return '';
      } else {
        return ' '.repeat(a);
      }
    }

    function extractValueByKey(arr, key) {
      const foundItem = arr.find(obj => obj.hasOwnProperty(key));
      return foundItem && foundItem[key];
    }

    function replaceValueByKey(arr, keyToReplace, newValue) {
      const index = arr.findIndex(obj => keyToReplace in obj);

      if (index === -1) {
        arr.push({[keyToReplace]: newValue});
      } else if (newValue > Object.values(arr[index])[0]) {
        arr[index][keyToReplace] = newValue;
      }

      return arr;
    }

    let arr = [];

    return {
      ImportDeclaration(node) {
        if (node.specifiers.length === 0) {
          return;
        }

        const getFilename = context.getFilename();
        const sourceCode = context.getSourceCode();
        const first = sourceCode.getLastToken(node.specifiers[node.specifiers.length - 1]);
        const second = sourceCode.getTokenAfter(first, {
          includeComments: true,
        });
        const spaceBetweenLastSpecAndBraces = sourceCode.isSpaceBetween(first, second);
        const specifierType = node?.specifiers[node.specifiers.length - 1].type;
        const spaceLastSpecAndBrace = specifierType === 'ImportSpecifier' ? (spaceBetweenLastSpecAndBraces ? 2 : 1) : 0;
        const specifierEndPosOfRange = node?.specifiers[node.specifiers.length - 1]?.range[1] + spaceLastSpecAndBrace;
        const specifierEndPosOfLine = node?.specifiers[node.specifiers.length - 1]?.loc.end.column + spaceLastSpecAndBrace;
        const sourceStartPosOfRange = node?.source?.range[0];
        const rangeOfSpaceBtwSpecifierAndSource = [specifierEndPosOfRange, sourceStartPosOfRange];

        if (!extractValueByKey(arr, getFilename)) {
          const importNodes = node.parent.body.filter(n => n?.source?.range !== null & n?.source?.range !== undefined & n?.source?.range !== undefined);

          importNodes.forEach((n) => {
            if (n.specifiers.length === 0) {
              return;
            }

            const lastSpecifier = n?.specifiers[n.specifiers.length - 1];
            const specifierType = lastSpecifier.type;
            const braceAfterLastSpecifier = sourceCode.getTokenAfter(lastSpecifier, {
              includeComments: true,
            });
            const spaceBtwLastSpecAndBrace = sourceCode.isSpaceBetween(lastSpecifier, braceAfterLastSpecifier);
            const NumOfSpaceBtwLastSpecAndBrace = specifierType === 'ImportSpecifier' ? (spaceBtwLastSpecAndBrace ? 2 : 1) : 0;

            if (lastSpecifier) {
              const endColumn = lastSpecifier?.loc.end.column;
              arr = replaceValueByKey(arr, getFilename, endColumn + NumOfSpaceBtwLastSpecAndBrace);
            }
          });
        }

        const endOfSpecifiers = extractValueByKey(arr, getFilename);
        const startOfSourceWithoutFrom = node.source.loc.start.column - 6; // на ' from '

        if (endOfSpecifiers !== startOfSourceWithoutFrom) {
          context.report({
            node: node,
            message: 'Incorrect number of indents in imports',
            fix(fixer) {
              return fixer.replaceTextRange(
                  rangeOfSpaceBtwSpecifierAndSource,
                  generateSpaces(
                      endOfSpecifiers - specifierEndPosOfLine,
                  ) + ' from ',
              );
            },
          });
        }
      },
    };
  },
};
