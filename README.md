# that-api
Shared component library for the api microservices.

@thatconference/api

## Publishing new versions

1. ENSURE `package.json` version is updated to new semver value!
1. Create a release in GitHub using `v` + semver value as tag (e.g. `v1.7.0`)
  1. Add release notes and changes made to this version
1. From local command line at same tag point run `$ npm run npm:publish`
  1. version is published to npmjs.com
  
