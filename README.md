# that-api

Shared component library for the api microservices.

@thatconference/api

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
