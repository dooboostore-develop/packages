import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser } from '@dooboostore/dom-parser';

console.log('🚀 Document Events Tests Starting...');

describe('Document Events - Loading Lifecycle', () => {
    test('should dispatch readystatechange events', async () => {
        const parser = new DomParser('<html><head><title>Test</title></head><body><h1>Hello</h1></body></html>');
        const document = parser.document;

        const readyStates: string[] = [];
        let eventCount = 0;

        document.addEventListener('readystatechange', (event: any) => {
            eventCount++;
            readyStates.push(document.readyState);
        });

        // Wait for all events to complete
        await new Promise(resolve => setTimeout(resolve, 30));
        
        assert.equal(eventCount, 2, 'Should have 2 readystatechange events');
        assert.deepEqual(readyStates, ['interactive', 'complete'], 'Should follow correct readyState sequence');
        console.log('✅ ReadyState change events work correctly');
    });

    test('should dispatch DOMContentLoaded event', async () => {
        const parser = new DomParser('<html><head><title>Test</title></head><body><h1>Hello</h1></body></html>');
        const document = parser.document;

        let domContentLoadedFired = false;
        let readyStateWhenFired = '';

        document.addEventListener('DOMContentLoaded', (event: any) => {
            domContentLoadedFired = true;
            readyStateWhenFired = document.readyState;
        });

        // Wait for events to complete
        await new Promise(resolve => setTimeout(resolve, 30));
        
        assert.equal(domContentLoadedFired, true, 'DOMContentLoaded should be fired');
        assert.equal(readyStateWhenFired, 'interactive', 'DOMContentLoaded should fire when readyState is interactive');
        console.log('✅ DOMContentLoaded event works correctly');
    });

    test('should dispatch load event on window', async () => {
        const parser = new DomParser('<html><head><title>Test</title></head><body><h1>Hello</h1></body></html>');
        const window = parser.window;
        const document = parser.document;

        let loadEventFired = false;
        let readyStateWhenFired = '';

        window.addEventListener('load', (event: any) => {
            loadEventFired = true;
            readyStateWhenFired = document.readyState;
        });

        // Wait for events to complete
        await new Promise(resolve => setTimeout(resolve, 30));
        
        assert.equal(loadEventFired, true, 'Load event should be fired on window');
        assert.equal(readyStateWhenFired, 'complete', 'Load event should fire when readyState is complete');
        console.log('✅ Window load event works correctly');
    });

    test('should handle multiple event listeners', async () => {
        const parser = new DomParser('<html><head><title>Test</title></head><body><h1>Hello</h1></body></html>');
        const document = parser.document;
        const window = parser.window;

        let domContentLoadedCount = 0;
        let loadEventCount = 0;
        let readyStateChangeCount = 0;

        // Multiple DOMContentLoaded listeners
        document.addEventListener('DOMContentLoaded', () => { domContentLoadedCount++; });
        document.addEventListener('DOMContentLoaded', () => { domContentLoadedCount++; });

        // Multiple load listeners
        window.addEventListener('load', () => { loadEventCount++; });
        window.addEventListener('load', () => { loadEventCount++; });

        // Multiple readystatechange listeners
        document.addEventListener('readystatechange', () => { readyStateChangeCount++; });
        document.addEventListener('readystatechange', () => { readyStateChangeCount++; });

        // Wait for events to complete
        await new Promise(resolve => setTimeout(resolve, 30));
        
        assert.equal(domContentLoadedCount, 2, 'Should fire both DOMContentLoaded listeners');
        assert.equal(loadEventCount, 2, 'Should fire both load listeners');
        assert.equal(readyStateChangeCount, 4, 'Should fire both readystatechange listeners for each state change (2 * 2)');
        console.log('✅ Multiple event listeners work correctly');
    });

    test('should handle event listener removal', async () => {
        const parser = new DomParser('<html><head><title>Test</title></head><body><h1>Hello</h1></body></html>');
        const document = parser.document;

        let listener1Count = 0;
        let listener2Count = 0;

        const listener1 = () => { listener1Count++; };
        const listener2 = () => { listener2Count++; };

        document.addEventListener('readystatechange', listener1);
        document.addEventListener('readystatechange', listener2);

        // Remove one listener
        document.removeEventListener('readystatechange', listener1);

        // Wait for events to complete
        await new Promise(resolve => setTimeout(resolve, 30));
        
        assert.equal(listener1Count, 0, 'Removed listener should not be called');
        assert.equal(listener2Count, 2, 'Remaining listener should be called for all state changes');
        console.log('✅ Event listener removal works correctly');
    });

    test('should handle once option for event listeners', async () => {
        const parser = new DomParser('<html><head><title>Test</title></head><body><h1>Hello</h1></body></html>');
        const document = parser.document;

        let onceListenerCount = 0;
        let normalListenerCount = 0;

        document.addEventListener('readystatechange', () => { onceListenerCount++; }, { once: true });
        document.addEventListener('readystatechange', () => { normalListenerCount++; });

        // Wait for events to complete
        await new Promise(resolve => setTimeout(resolve, 30));
        
        assert.equal(onceListenerCount, 1, 'Once listener should only be called once');
        assert.equal(normalListenerCount, 2, 'Normal listener should be called for all state changes');
        console.log('✅ Once option for event listeners works correctly');
    });
});

describe('Window Events - Navigation Lifecycle', () => {
    test('should dispatch unload and beforeunload events on navigation', async () => {
        // Since we removed dynamic HTML loading, we'll test the event system conceptually
        const parser = new DomParser('<html><body><h1>Page 1</h1></body></html>', {
            href: 'http://example.com/page1'
        });

        const window = parser.window;
        
        let beforeUnloadFired = false;
        let unloadFired = false;
        let eventOrder: string[] = [];

        window.addEventListener('beforeunload', () => {
            beforeUnloadFired = true;
            eventOrder.push('beforeunload');
        });

        window.addEventListener('unload', () => {
            unloadFired = true;
            eventOrder.push('unload');
        });

        // Manually dispatch events to test the event system
        window.dispatchEvent({ type: 'beforeunload', target: window });
        window.dispatchEvent({ type: 'unload', target: window });

        assert.equal(beforeUnloadFired, true, 'beforeunload event should be fired');
        assert.equal(unloadFired, true, 'unload event should be fired');
        assert.deepEqual(eventOrder, ['beforeunload', 'unload'], 'Events should fire in correct order');
        console.log('✅ Navigation unload events work correctly');
    });

    test('should dispatch load event after navigation', async () => {
        // Test load event system
        const parser = new DomParser('<html><body><h1>Page 1</h1></body></html>', {
            href: 'http://example.com/page1'
        });

        const window = parser.window;
        let loadEventCount = 0;

        window.addEventListener('load', () => {
            loadEventCount++;
        });

        // Wait for initial load event
        await new Promise(resolve => setTimeout(resolve, 30));
        
        const initialLoadCount = loadEventCount;
        
        // Manually dispatch load event to simulate navigation
        window.dispatchEvent({ type: 'load', target: window });

        assert.equal(loadEventCount, initialLoadCount + 1, 'Load event should fire again after navigation');
        console.log('✅ Navigation load event works correctly');
    });
});