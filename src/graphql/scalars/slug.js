import { GraphQLScalarType } from 'graphql';
import { GraphQLError } from 'graphql/error';
import { Kind } from 'graphql/language';
import debug from 'debug';

const dlog = debug('that:api:scalars:slug');

const isString = value => {
  if (typeof value !== 'string') {
    throw new TypeError('Value is not of type string');
  }

  return true;
};

const validateSlug = slug => {
  dlog('validateSlug');
  const regexp = /^[a-zA-Z0-9-_]+$/g;
  const v = slug.match(regexp);
  if (!v) {
    throw new TypeError('Slug contains invalid characters');
  }
  return true;
};

export default {
  Slug: new GraphQLScalarType({
    name: 'Slug',
    description: 'Slug custom scalar type',

    // value from cliemt
    parseValue(value) {
      dlog('parse value');
      isString(value);
      validateSlug(value);
      return value.toLowerCase();
    },

    // value to client
    serialize(value) {
      dlog('serialize');
      isString(value);
      return value.toLowerCase();
    },

    parseLiteral(ast) {
      dlog('parseLiteral');
      if (ast.kind !== Kind.STRING) {
        throw new GraphQLError(`Slugs must be string but got ${ast.kind}`);
      }

      validateSlug(ast.value);
      return ast.value.toLowerCase();
    },
  }),
};
