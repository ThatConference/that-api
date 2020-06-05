import moment from 'moment';
import _ from 'lodash';
import { GraphQLScalarType } from 'graphql';
import { GraphQLError } from 'graphql/error';
import { Kind } from 'graphql/language';

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
      validateString(value);
      validateDateFormat(value);

      return value;
    },

    // sent to the client
    serialize(value) {
      isDate(value);
      return moment(value).toJSON();
    },

    parseLiteral(ast) {
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
