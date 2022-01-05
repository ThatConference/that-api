/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */

import { SchemaDirectiveVisitor, ForbiddenError } from 'apollo-server';
import { defaultFieldResolver } from 'graphql';
import debug from 'debug';

const dlog = debug('that:api:directive:auth');

class AuthDirective extends SchemaDirectiveVisitor {
  visitObject(type) {
    dlog('visit Object');
    this.ensureFieldsWrapped(type);
    type._requiredAuthRole = this.args.requires;
  }

  visitFieldDefinition(field, details) {
    dlog('visit Field Definition');
    this.ensureFieldsWrapped(details.objectType);
    field._requiredAuthRole = this.args.requires;
  }

  ensureFieldsWrapped(objectType) {
    dlog('ensured Fields Wrapped');

    if (objectType._authFieldsWrapped) return;
    objectType._authFieldsWrapped = true;
    const fields = objectType.getFields();

    Object.keys(fields).forEach(fieldName => {
      dlog('for each field', fieldName);

      const field = fields[fieldName];
      const { resolve = defaultFieldResolver } = field;

      field.resolve = async (...args) => {
        dlog('resolving');
        const requiredRole =
          field._requiredAuthRole || objectType._requiredAuthRole;

        if (!requiredRole) {
          return resolve.apply(this, args);
        }

        const context = args[2];
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

        if (!user.permissions.includes(requiredRole)) {
          dlog(
            'This user does not have the required role to access the resource.',
          );

          throw new ForbiddenError(
            'not authorized to perform requested action',
          );
        }

        return resolve.apply(this, args);
      };
    });
  }
}

export default AuthDirective;
