const stripAnsi = require('strip-ansi');
const {main} = require('../src/core');

const fakeStream = () => {
  const content = [];
  return {
    write(chunk) {
      content.push(chunk);
    },
    getContent() {
      return content.join('');
    }
  };
};

describe('Integrations tests', () => {
  it('fetch just a single package', done => {
    const stream = fakeStream();
    // had to pin version for test stability
    return main({argv: {_: ['lodash@4.12.0']}, stream, noOra: true})
      .then(() => {
        const output = stream.getContent();
        expect(stripAnsi(output)).toEqual(
          `- Fetching stats for package lodash@4.12.0
ℹ lodash (4.12.0) has 0 dependencies for a weight of 63.14KB (22.01KB gzipped)
`
        );

        return done();
      })
      .catch(done);
  });
});
