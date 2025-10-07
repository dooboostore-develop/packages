import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { DomParser } from '@dooboostore/dom-parser';

console.log('🚀 PopState Event Tests Starting...');

describe('PopState Events - History Navigation', () => {
    test('should register and trigger popstate event listeners', () => {
        const parser = new DomParser('');
        const window = parser.window;

        let eventTriggered = false;
        let eventData: any = null;

        // Register popstate event listener
        window.addEventListener('popstate', (event: any) => {
            eventTriggered = true;
            eventData = event;
        });

        // Simulate history navigation that should trigger popstate
        window.history.pushState({ page: 'home' }, 'Home', '/home');
        window.history.pushState({ page: 'about' }, 'About', '/about');
        
        // Going back should trigger popstate
        window.history.back();

        assert.equal(eventTriggered, true, 'PopState event should be triggered');
        assert.ok(eventData, 'Event data should be provided');
        assert.equal(eventData.type, 'popstate', 'Event type should be popstate');
        assert.deepEqual(eventData.state, { page: 'home' }, 'Event state should match history state');

        console.log('✅ PopState event registration and triggering works');
    });

    test('should handle multiple popstate event listeners', () => {
        const parser = new DomParser('');
        const window = parser.window;

        let listener1Triggered = false;
        let listener2Triggered = false;
        let listener1Data: any = null;
        let listener2Data: any = null;

        // Register multiple popstate event listeners
        const listener1 = (event: any) => {
            listener1Triggered = true;
            listener1Data = event;
        };

        const listener2 = (event: any) => {
            listener2Triggered = true;
            listener2Data = event;
        };

        window.addEventListener('popstate', listener1);
        window.addEventListener('popstate', listener2);

        // Trigger popstate event
        window.history.pushState({ test: 'data1' }, 'Test 1', '/test1');
        window.history.pushState({ test: 'data2' }, 'Test 2', '/test2');
        window.history.back();

        assert.equal(listener1Triggered, true, 'First listener should be triggered');
        assert.equal(listener2Triggered, true, 'Second listener should be triggered');
        assert.deepEqual(listener1Data.state, { test: 'data1' }, 'First listener should receive correct state');
        assert.deepEqual(listener2Data.state, { test: 'data1' }, 'Second listener should receive correct state');

        console.log('✅ Multiple popstate event listeners work');
    });

    test('should remove popstate event listeners correctly', () => {
        const parser = new DomParser('');
        const window = parser.window;

        let listener1Triggered = false;
        let listener2Triggered = false;

        const listener1 = () => { listener1Triggered = true; };
        const listener2 = () => { listener2Triggered = true; };

        // Add listeners
        window.addEventListener('popstate', listener1);
        window.addEventListener('popstate', listener2);

        // Remove one listener
        window.removeEventListener('popstate', listener1);

        // Trigger popstate event
        window.history.pushState({ test: 'remove' }, 'Remove Test', '/remove');
        window.history.pushState({ test: 'remove2' }, 'Remove Test 2', '/remove2');
        window.history.back();

        assert.equal(listener1Triggered, false, 'Removed listener should not be triggered');
        assert.equal(listener2Triggered, true, 'Remaining listener should be triggered');

        console.log('✅ PopState event listener removal works');
    });

    test('should handle history.go() with popstate events', () => {
        const parser = new DomParser('');
        const window = parser.window;

        const events: any[] = [];

        window.addEventListener('popstate', (event: any) => {
            events.push(event.state);
        });

        // Build history stack
        window.history.pushState({ step: 1 }, 'Step 1', '/step1');
        window.history.pushState({ step: 2 }, 'Step 2', '/step2');
        window.history.pushState({ step: 3 }, 'Step 3', '/step3');
        window.history.pushState({ step: 4 }, 'Step 4', '/step4');

        // Go back 2 steps
        window.history.go(-2);

        assert.equal(events.length, 1, 'Should trigger one popstate event');
        assert.deepEqual(events[0], { step: 2 }, 'Should navigate to correct state');

        // Go forward 1 step
        window.history.go(1);

        assert.equal(events.length, 2, 'Should trigger second popstate event');
        assert.deepEqual(events[1], { step: 3 }, 'Should navigate forward to correct state');

        console.log('✅ History.go() with popstate events works');
    });

    test('should handle history.forward() and history.back()', () => {
        const parser = new DomParser('');
        const window = parser.window;

        const events: any[] = [];

        window.addEventListener('popstate', (event: any) => {
            events.push({ state: event.state, url: event.url });
        });

        // Build history
        window.history.pushState({ page: 'home' }, 'Home', '/home');
        window.history.pushState({ page: 'about' }, 'About', '/about');
        window.history.pushState({ page: 'contact' }, 'Contact', '/contact');

        // Go back twice
        window.history.back();
        assert.equal(events.length, 1, 'First back() should trigger popstate');
        assert.deepEqual(events[0].state, { page: 'about' }, 'Should go back to about page');

        window.history.back();
        assert.equal(events.length, 2, 'Second back() should trigger popstate');
        assert.deepEqual(events[1].state, { page: 'home' }, 'Should go back to home page');

        // Go forward
        window.history.forward();
        assert.equal(events.length, 3, 'forward() should trigger popstate');
        assert.deepEqual(events[2].state, { page: 'about' }, 'Should go forward to about page');

        console.log('✅ History.back() and history.forward() work');
    });

    test('should not trigger popstate for pushState and replaceState', () => {
        const parser = new DomParser('');
        const window = parser.window;

        let eventTriggered = false;

        window.addEventListener('popstate', () => {
            eventTriggered = true;
        });

        // pushState and replaceState should NOT trigger popstate
        window.history.pushState({ test: 'push' }, 'Push Test', '/push');
        assert.equal(eventTriggered, false, 'pushState should not trigger popstate');

        window.history.replaceState({ test: 'replace' }, 'Replace Test', '/replace');
        assert.equal(eventTriggered, false, 'replaceState should not trigger popstate');

        console.log('✅ pushState and replaceState do not trigger popstate');
    });

    test('should handle once option for event listeners', () => {
        const parser = new DomParser('');
        const window = parser.window;

        let triggerCount = 0;

        // Add listener with once: true option
        window.addEventListener('popstate', () => {
            triggerCount++;
        }, { once: true });

        // Build history and navigate
        window.history.pushState({ test: 1 }, 'Test 1', '/test1');
        window.history.pushState({ test: 2 }, 'Test 2', '/test2');
        
        // First navigation should trigger the listener
        window.history.back();
        assert.equal(triggerCount, 1, 'Listener should be triggered once');

        // Second navigation should not trigger the listener (it was removed)
        window.history.forward();
        assert.equal(triggerCount, 1, 'Listener should not be triggered again (once option)');

        console.log('✅ Event listener once option works');
    });

    test('should update location when navigating through history', () => {
        const parser = new DomParser('');
        const window = parser.window;

        // Build history with URLs
        window.history.pushState({ page: 'home' }, 'Home', '/home');
        window.history.pushState({ page: 'about' }, 'About', '/about?tab=info');
        window.history.pushState({ page: 'contact' }, 'Contact', '/contact#form');

        // Navigate back and check location
        window.history.back();
        assert.equal(window.location.pathname, '/about', 'Location pathname should update');
        assert.equal(window.location.search, '?tab=info', 'Location search should update');

        window.history.back();
        assert.equal(window.location.pathname, '/home', 'Location should update to home');
        assert.equal(window.location.search, '', 'Search should be empty for home');

        window.history.forward();
        assert.equal(window.location.pathname, '/about', 'Forward navigation should update location');
        assert.equal(window.location.search, '?tab=info', 'Search should be restored');

        console.log('✅ Location updates during history navigation work');
    });
});