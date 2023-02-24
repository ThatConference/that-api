import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { GraphQLError } from 'graphql';
import debug from 'debug';

const { defaultFieldResolver } = require('graphql');

const dlog = debug('that:api:directive:auth');

function authDirectiveMapper(directiveName = 'auth') {
  dlog('authDirectiveMapper called as %s', directiveName);

  const typeDirectiveArgumentMaps = {};

  return {
    authDirectiveTransformer: schema =>
      mapSchema(schema, {
        [MapperKind.TYPE]: type => {
          dlog('type resolved: %s', type?.name);

          const authDirective = getDirective(schema, type, directiveName)?.[0];

          if (authDirective) {
            typeDirectiveArgumentMaps[type.name] = authDirective;
          }

          return undefined;
        },
        // eslint-disable-next-line consistent-return
        [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
          dlog('resolve %s', typeName);
          const authDirective =
            getDirective(schema, fieldConfig, directiveName)?.[0] ??
            typeDirectiveArgumentMaps[typeName];

          if (authDirective) {
            const { requires } = authDirective;

            if (requires) {
              const { resolve = defaultFieldResolver } = fieldConfig;

              // eslint-disable-next-line no-param-reassign
              fieldConfig.resolve = (source, args, context, info) => {
                const { user } = context;

                if (!user) {
                  dlog('no user destructured from context');
                  throw new GraphQLError('context contains no user', {
                    extensions: { code: 'FORBIDDEN' },
                  });
                }

                dlog('user perm %o', user.permissions);

                if (!user.permissions) {
                  dlog('user does not have any permissions defined');
                  throw new GraphQLError('user has no permissions.', {
                    extensions: { code: 'FORBIDDEN' },
                  });
                }

                if (!user.permissions.includes(requires)) {
                  dlog(
                    'user missing required role to access resource, %s',
                    requires,
                  );

                  throw new GraphQLError(
                    'not authorized to perform requested action',
                    {
                      extensions: { code: 'FORBIDDEN' },
                    },
                  );
                }

                return resolve(source, args, context, info);
              };

              return fieldConfig;
            }
          }
        },
      }),
  };
}

export default authDirectiveMapper;
