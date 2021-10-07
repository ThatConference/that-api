/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */

import { SchemaDirectiveVisitor } from 'apollo-server';

class UpperCaseDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    // eslint-disable-next-line no-undef
    const { resolve = defaultFieldResolver } = field;
    // eslint-disable-next-line func-names
    field.resolve = async function (...args) {
      const result = await resolve.apply(this, args);
      if (typeof result === 'string') {
        return result.toUpperCase();
      }
      return result;
    };
  }
}

export default UpperCaseDirective;
