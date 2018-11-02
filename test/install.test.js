const yargs = require('yargs-parser');
const {npmOptionsFromArgv} = require('../src/install');

const parse = cmd => yargs(cmd, {configuration: {'camel-case-expansion': false}});

describe('npmOptionsFromArgv', () => {
  it('no options', () => {
    expect(npmOptionsFromArgv(parse('toto titi toto'))).toEqual('');
  });
  it('only bundle-phobia options', () => {
    expect(npmOptionsFromArgv(parse('-i --warn arg --interactive -w'))).toEqual('');
  });
  it('only non bundle-phobia options', () => {
    expect(npmOptionsFromArgv(parse('-S --some-opt arg --quiet'))).toEqual(
      '-S --some-opt arg --quiet'
    );
  });
  it('mixed options options', () => {
    expect(npmOptionsFromArgv(parse('toto -S -i --some-opt arg -w'))).toEqual('-S --some-opt arg');
  });
});
