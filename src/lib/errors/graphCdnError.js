export default class GraphCdnError extends Error {
  constructor(message) {
    super(message);
    this.name = 'GraphCdnError';
  }
}
