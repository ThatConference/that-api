import moment from 'moment';
import _ from 'lodash';
import debug from 'debug';

import { GraphQLScalarType } from 'graphql';
import { GraphQLError } from 'graphql/error';
import { Kind } from 'graphql/language';

const dlog = debug('that:api:scalars:date');

const isDate = value => {
  if (!moment(value).valueOf()) {
    throw new TypeError('Value is not Date or Moment Object');
  }

  return true;
};

const validateDateFormat = value => {
  const results = moment(value).isValid();
  if (results) return true;

  throw new TypeError();
};

const validateString = value => {
  if (!_.isString(value)) {
    throw new TypeError('Value is not string');
  }
  return true;
};

export default {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',

    // value from the client
    parseValue(value) {
      dlog('parsedValue %o', value);
      validateString(value);
      validateDateFormat(value);

      const parsedDate = new Date(value);
      dlog('parsed Date', parsedDate);

      return parsedDate;
    },

    // sent to the client
    serialize(value) {
      dlog('serialize %o', value);

      let result;
      if (value.toDate) {
        result = value.toDate();
      } else if (isDate(value)) {
        result = value;
      }

      return result;
    },

    parseLiteral(ast) {
      dlog('parseLiteral');
      if (ast.kind !== Kind.STRING) {
        throw new GraphQLError(
          `Can only validate strings as date but got a: ${ast.kind}`,
        );
      }

      validateDateFormat(ast.value);
      return ast.value;
    },
  }),
};
