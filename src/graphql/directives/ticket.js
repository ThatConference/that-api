/* eslint-disable class-methods-use-this */
import { SchemaDirectiveVisitor } from 'apollo-server';
import debug from 'debug';

const dlog = debug('that:api:directive:ticket');

class HasTicketDirective extends SchemaDirectiveVisitor {
  visitObject(type) {
    dlog('visitObject');
  }
}
