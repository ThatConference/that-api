import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { defaultFieldResolver } from 'graphql';
import debug from 'debug';

const dlog = debug('that:api:directive:upperCase');

function upperCaseDirectiveMapper(directiveName = 'upperCase') {
  dlog('upperCaseDirectiveMapper called as %s', directiveName);

  return {
    upperCaseDirectiveTransformer: schema =>
      mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: fieldConfig => {
          const upperDirective = getDirective(
            schema,
            fieldConfig,
            directiveName,
          )?.[0];
          if (upperDirective) {
            dlog('resolve: %s', fieldConfig?.astNode?.name?.value);
            const { resolve = defaultFieldResolver } = fieldConfig;
            return {
              ...fieldConfig,
              async resolve(source, args, context, info) {
                const result = await resolve(source, args, context, info);
                if (typeof result === 'string') {
                  dlog('setting value to upper case');
                  return result.toUpperCase();
                }

                return result;
              },
            };
          }

          return fieldConfig;
        },
      }),
  };
}

export default upperCaseDirectiveMapper;
