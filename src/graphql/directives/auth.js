import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { ForbiddenError } from 'apollo-server';
import debug from 'debug';

const { defaultFieldResolver } = require('graphql');

const dlog = debug('that:api:directive:auth');

function authDirectiveMapper(directiveName) {
  dlog('authDirectiveMapper called:', directiveName);

  const typeDirectiveArgumentMaps = {};

  return {
    authDirectiveTransformer: schema =>
      mapSchema(schema, {
        [MapperKind.TYPE]: type => {
          dlog('type resolved', type);

          const authDirective = getDirective(schema, type, directiveName)?.[0];

          if (authDirective) {
            typeDirectiveArgumentMaps[type.name] = authDirective;
          }

          return undefined;
        },
        // eslint-disable-next-line consistent-return
        [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
          dlog('resolve');
          const authDirective =
            getDirective(schema, fieldConfig, directiveName)?.[0] ||
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
                  throw new ForbiddenError('context contains no user.');
                }

                dlog('user perm %o', user.permissions);

                if (!user.permissions) {
                  dlog('user does not have any permissions defined');
                  throw new ForbiddenError('this user has no permissions.');
                }

                if (!user.permissions.includes(requires)) {
                  dlog(
                    'This user does not have the required role to access the resource.',
                  );

                  throw new ForbiddenError(
                    'not authorized to perform requested action',
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
