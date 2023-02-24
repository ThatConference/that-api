# that-api

> **Warning**: This is v4 of `that-api`. It's intended use is with Apollo server version 4. It is not compatible with Apollo server v2 or v3. V2 of this library is [here](https://github.com/ThatConference/that-api/tree/v2) and v3 is [here](https://github.com/ThatConference/that-api/tree/v3) ⚠

Shared component library for the api microservices.

Available as an npm package: `@thatconference/api`

## Development guidelines

- After initial clone of repository run:
  - npm i
  - npx husky install

`husky install` is put under npm:prepare by default, though it causes many issues with this babel generated product when publishing, etc. For now it has to be manual. Putting `husky install` under npm:postinstall, doesn't work as it will try to run when the package is installed in a project.

Module `graphql` is now defined as a peerDependency and not installed 'dependency' of this module. Due to this the **Basic local testing** below isn't currently working. 

`graphql`

## Basic local testing

Use npm linking to test locally with this package.

Starting with that-api directory

```sh
cd that-api
npm run validate
npm run build
cd __build__
npm link
cd ..
npm run dev
```

Now at the api project e.g. that-api-members

```sh
cd that-api-members
npm run validate
npm link @thatconference/api
npm run validate
npm run start:watch
```

At this point the that-api-members project is running using the linked that-api package, not the one downloaded into its node_modules folder.

So to undo this. I am not 100% sure this is correct, but it seems to work.

Unlink the the package from that-api-members.

```sh
^c
cd ~/tc/that-api-members
npm unlink @thatconference/api
npm i @thatconference/api
```

Stop the running code and unlink to remove the link from npm which removes it from global location `{prefix}/lib/node_modules/<package>`

```sh
^c
cd ~/tc/that-api/
npm unlink
cd ..
```

When you unlink a package it removes it from packages.json, so we need to then add it back. This is why we removed the global link first so we could install and get the package, not the link.

## Publishing new versions

1. ENSURE `package.json` version is updated to new semver value!
1. Create a release in GitHub using `v` + semver value as tag (e.g. `v1.7.0`)
   - **Add release notes and changes made to this version**
1. From local command line at same tag point run `$ npm run npm:publish`
   - version is published to npmjs.com

## Contains shared stuff for API's

### Data Sources

- assets
- events
- favorites
- history
- member
- product
- slug

### Utility

- firestoreDateForge
- getValueAtPath

### API Constants

Shard constants used across the api. The constants are in JavaScript object form.

### GraphQL

#### Directives

- auth
- lowerCase
- upperCase

**v3** requires a different way to map directives to your schema. The directive returns a `transformer` function which you pass the schema into and get an updated schema back.

```js
const schema = authDirectiveTransformer(
   buildSubgraphSchema([{typeDefs, resolvers}]);
)
```

For multiple directives use a reduce like so

```js
let schema = buildSubgraphSchema([{ typeDefs, resolvers }]);
const directiveTransformers = [authDirectiveTransformer, lowerCaseDirectiveTransformer];

schema = directiveTransformers.reduce((curSchema, transformer) => transformer(schema), schema)
```

**GraphQl schema** for directives

```graphql
directive @auth(requires: String!) on OBJECT | FIELD_DEFINITION
directive @lowerCase on FIELD_DEFINITION
directive @upperCase on FIELD_DEFINITION
```

#### Events

- lifecycle (_currently removed w/ InFluxdb_)

#### Middleware

- requestLogger (_currently removed w/ InFluxdb_)

#### Scalars

- date
- slug

#### Mentions

- parseToSlug
- parseToToken
