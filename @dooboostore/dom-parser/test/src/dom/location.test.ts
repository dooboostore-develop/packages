import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser } from '@dooboostore/dom-parser';

console.log('🚀 Location Tests Starting...');

describe('Location - URL Management', () => {
    test('should handle default location initialization', () => {
        const parser = new DomParser('');
        const window = parser.window;

        // Test default location
        assert.equal(window.location.href, 'about:blank', 'Default href should be about:blank');
        assert.equal(window.location.protocol, 'about:', 'Default protocol should be about:');
        assert.equal(window.location.pathname, 'blank', 'Default pathname should be blank');
        assert.equal(window.location.origin, 'null', 'Default origin should be null');

        console.log('✅ Default location initialization works');
    });

    test('should parse and manage URL components correctly', () => {
        const parser = new DomParser('');
        const window = parser.window;

        // Test setting href
        window.location.href = 'https://example.com/path?query=1#hash';
        
        assert.equal(window.location.href, 'https://example.com/path?query=1#hash', 'Should set complete href');
        assert.equal(window.location.protocol, 'https:', 'Should parse protocol correctly');
        assert.equal(window.location.host, 'example.com', 'Should parse host correctly');
        assert.equal(window.location.hostname, 'example.com', 'Should parse hostname correctly');
        assert.equal(window.location.port, '', 'Should have empty port for default ports');
        assert.equal(window.location.pathname, '/path', 'Should parse pathname correctly');
        assert.equal(window.location.search, '?query=1', 'Should parse search correctly');
        assert.equal(window.location.hash, '#hash', 'Should parse hash correctly');
        assert.equal(window.location.origin, 'https://example.com', 'Should parse origin correctly');

        console.log('✅ URL parsing works correctly');
    });

    test('should handle individual property changes', () => {
        const parser = new DomParser('');
        const window = parser.window;

        // Set initial URL
        window.location.href = 'https://example.com/path?query=1#hash';

        // Test pathname change
        window.location.pathname = '/new-path';
        assert.equal(window.location.href, 'https://example.com/new-path?query=1#hash', 'Should update href when pathname changes');

        // Test search change
        window.location.search = '?new=query';
        assert.equal(window.location.href, 'https://example.com/new-path?new=query#hash', 'Should update href when search changes');

        // Test hash change
        window.location.hash = '#new-hash';
        assert.equal(window.location.href, 'https://example.com/new-path?new=query#new-hash', 'Should update href when hash changes');

        console.log('✅ Individual property changes work');
    });

    test('should handle port management correctly', () => {
        const parser = new DomParser('');
        const window = parser.window;

        // Test URL with port
        window.location.href = 'https://example.com:8080/path';
        
        assert.equal(window.location.href, 'https://example.com:8080/path', 'Should handle URL with port');
        assert.equal(window.location.host, 'example.com:8080', 'Should include port in host');
        assert.equal(window.location.hostname, 'example.com', 'Should exclude port from hostname');
        assert.equal(window.location.port, '8080', 'Should parse port correctly');

        // Test port change
        window.location.port = '9000';
        assert.equal(window.location.href, 'https://example.com:9000/path', 'Should update href when port changes');
        assert.equal(window.location.host, 'example.com:9000', 'Should update host when port changes');

        console.log('✅ Port management works correctly');
    });

    test('should support initial URL in constructor', () => {
        const parser = new DomParser('', { href: 'http://localhost:3000/app' });
        const window = parser.window;

        assert.equal(window.location.href, 'http://localhost:3000/app', 'Should set initial URL from constructor');
        assert.equal(window.location.protocol, 'http:', 'Should parse protocol from initial URL');
        assert.equal(window.location.host, 'localhost:3000', 'Should parse host from initial URL');
        assert.equal(window.location.pathname, '/app', 'Should parse pathname from initial URL');

        console.log('✅ Initial URL in constructor works');
    });

    test('should handle navigation methods', () => {
        const parser = new DomParser('');
        const window = parser.window;

        // Test assign method
        window.location.assign('https://example.com/page1');
        assert.equal(window.location.href, 'https://example.com/page1', 'assign() should change URL');

        // Test replace method
        window.location.replace('https://example.com/page2');
        assert.equal(window.location.href, 'https://example.com/page2', 'replace() should change URL');

        // Test reload method (should not throw error)
        assert.doesNotThrow(() => {
            window.location.reload();
        }, 'reload() should not throw error');

        console.log('✅ Navigation methods work');
    });

    test('should handle special URLs correctly', () => {
        const parser = new DomParser('');
        const window = parser.window;

        // Test about:blank
        window.location.href = 'about:blank';
        assert.equal(window.location.href, 'about:blank', 'Should handle about:blank');
        assert.equal(window.location.protocol, 'about:', 'Should parse about: protocol');

        // Test file protocol
        window.location.href = 'file:///path/to/file.html';
        assert.equal(window.location.protocol, 'file:', 'Should handle file: protocol');

        console.log('✅ Special URLs work correctly');
    });

    test('should handle toString method', () => {
        const parser = new DomParser('');
        const window = parser.window;

        window.location.href = 'https://example.com/path?query=1#hash';
        
        assert.equal(window.location.toString(), 'https://example.com/path?query=1#hash', 'toString() should return href');
        assert.equal(String(window.location), 'https://example.com/path?query=1#hash', 'String conversion should work');

        console.log('✅ toString method works');
    });
});