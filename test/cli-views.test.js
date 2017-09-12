const stripAnsi = require('strip-ansi');
const {lodashStats} = require('./fixtures');
const {syntheticView} = require('../lib/cli-views');

describe('syntheticView', () => {

    it('basic lodash stats', () => {
        const lodashView = stripAnsi(syntheticView(lodashStats));
        expect(lodashView).toEqual('lodash (4.17.4) has 0 dependencies for a weight of 70870B (24666B gzipped)');
    });

});
