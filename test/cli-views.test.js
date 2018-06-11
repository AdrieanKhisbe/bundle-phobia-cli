const stripAnsi = require('strip-ansi');
const {lodashStats} = require('./fixtures');
const {getView, syntheticView, jsonView, sizeView, gzipsizeView, dependenciesView} = require('../lib/cli-views');

describe('syntheticView', () => {

    it('basic lodash stats', () => {
        const lodashView = stripAnsi(syntheticView(lodashStats));
        expect(lodashView).toEqual('lodash (4.17.4) has 0 dependencies for a weight of 69.21KB (24.09KB gzipped)');
    });

});


describe('simpleViews', () => {

    it('sizeView', () => {
        expect(sizeView(lodashStats)).toEqual(70870);
    });
    it('gzipsizeView', () => {
        expect(gzipsizeView(lodashStats)).toEqual(24666);
    });
    it('dependenciesView', () => {
        expect(dependenciesView(lodashStats)).toEqual(0);
    });

});



describe('getView', () => {
    it('retrieve synthetic view by default', () => {
        expect(getView()).toEqual(syntheticView)
    });

    it('retrieve size view by demand', () => {
        expect(getView({size: true})).toEqual(sizeView)
    });

    it('retrieve gzip size view by demand', () => {
        expect(getView({'gzip-size': true})).toEqual(gzipsizeView)
    });

    it('retrieve dependencies view by demand', () => {
        expect(getView({dependencies: true})).toEqual(dependenciesView)
    });

    it('retrieve dependencies view by demand', () => {
        expect(getView({json: true})).toEqual(jsonView)
    });

    it('throw erreur when multiple args', () => {
       expect(() => getView({json: true, size: true}).toThrow());
    });

})
