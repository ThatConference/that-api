# that-api

Shared component library for the api microservices.

@thatconference/api

## Development guidelines

- After initial clone of repository run:
  - npm i
  - npx husky install

`husky install` is put under npm:prepare by default, though it causes many issues with this babel generated product when publishing, etc. For now it has to be manual. Putting `husky install` under npm:postinstall, doesn't work as it will try to run when the package is installed in a project.

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

- firstoreDateForge
- getValueAtPath

### API Constants

### GraphQL

#### Directives

- auth
- lowerCase
- upperCase

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
