import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { defaultFieldResolver } from 'graphql';
import debug from 'debug';

const dlog = debug('that:api:directive:lower');

function lowerCaseDirectiveMapper(directiveName) {
  return {
    lowerCaseDirectiveTransformer: schema =>
      mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: fieldConfig => {
          const lowerDirective = getDirective(
            schema,
            fieldConfig,
            directiveName,
          )?.[0];
          if (lowerDirective) {
            const { resolve = defaultFieldResolver } = fieldConfig;
            return {
              ...fieldConfig,
              async resolve(source, args, context, info) {
                const result = await resolve(source, args, context, info);
                if (typeof result === 'string') {
                  dlog('setting value to lower case');
                  return result.toLowerCase();
                }
                return result;
              },
            };
          }

          return undefined;
        },
      }),
  };
}

export default lowerCaseDirectiveMapper;
