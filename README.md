# eslint-plugin-vertical-straight-align

Makes your imports smooth and easy to read

![eslint-plugin-vertical-straight-align_2](https://i.makeagif.com/media/3-03-2024/8QxO99.gif)

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
npm i eslint --save-dev
```

Next, install `eslint-plugin-vertical-straight-align`:

```sh
npm install eslint-plugin-vertical-straight-align --save-dev
```

## Usage

Add `vertical-straight-align` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "vertical-straight-align"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "vertical-straight-align/align-imports": "error"
    }
}
```

## Rules

<!-- begin auto-generated rules list -->
TODO: Run eslint-doc-generator to generate the rules list.
<!-- end auto-generated rules list -->


