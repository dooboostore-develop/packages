import { Rect } from '@dooboostore/core/entity/Rect';
import { Point2D } from '@dooboostore/core/entity/Point2D';
import { WrapRects } from '@dooboostore/core/entity/WrapRects';
import { SizeType } from '@dooboostore/core/entity/SizeType';

export const wrapRectsTest = () => {

    console.log('--- WrapRects Test ---');

    function assert(condition: boolean, message: string) {
        if (condition) {
            console.log(`✅ PASS: ${message}`);
        } else {
            console.error(`❌ FAIL: ${message}`);
        }
    }

    // --- Test WrapRects Constructor and Initial State ---
    console.log('\n--- Testing WrapRects Constructor ---');
    const initialRects: Rect[] = [
        new Rect(0, 0, 10, 10),
        new Rect(20, 20, 10, 10)
    ];
    const wrapRects1 = new WrapRects(0, 0, 0, 0, initialRects);
    assert(wrapRects1.rects.size === 2, 'WrapRects constructor: initial rects size');
    assert(wrapRects1.x === 0 && wrapRects1.y === 0 && wrapRects1.width === 30 && wrapRects1.height === 30, 'WrapRects constructor: initial bounds calculation');
    console.log('---->',wrapRects1.x,wrapRects1.y,wrapRects1.width,wrapRects1.height);
    const wrapRectsEmpty = new WrapRects(0, 0, 0, 0);
    assert(wrapRectsEmpty.rects.size === 0, 'WrapRects constructor: empty initial rects');
    assert(wrapRectsEmpty.x === 0 && wrapRectsEmpty.y === 0 && wrapRectsEmpty.width === 0 && wrapRectsEmpty.height === 0, 'WrapRects constructor: empty bounds');

    // --- Test add method ---
    console.log('\n--- Testing add method ---');
    const wrapRectsAdd = new WrapRects(0, 0, 0, 0);
    const rectA = new Rect(5, 5, 10, 10);
    const rectB = new Rect(15, 15, 5, 5);

    wrapRectsAdd.add(rectA);
    assert(wrapRectsAdd.rects.size === 1, 'add: single rect');
    assert(wrapRectsAdd.x === 0 && wrapRectsAdd.y === 0 && wrapRectsAdd.width === 15 && wrapRectsAdd.height === 15, 'add: bounds after single rect');

    wrapRectsAdd.add(rectB);
    assert(wrapRectsAdd.rects.size === 2, 'add: multiple rects');
    assert(wrapRectsAdd.x === 0 && wrapRectsAdd.y === 0 && wrapRectsAdd.width === 20 && wrapRectsAdd.height === 20, 'add: bounds after multiple rects');

    // --- Test remove method ---
    console.log('\n--- Testing remove method ---');
    const rectToRemove1 = new Rect(-20, -20, 10, 10);
    const rectToRemove2 = new Rect(10, 10, 10, 10);
    const wrapRectsRemove = new WrapRects(-10, -10, 10, 10, [rectToRemove1, rectToRemove2 ]);
    assert(wrapRectsRemove.x === -20 && wrapRectsRemove.y === -20 && wrapRectsRemove.width === 40 && wrapRectsRemove.height === 40, 'remove: initial bounds for remove test');

    wrapRectsRemove.remove(rectToRemove1);
    assert(wrapRectsRemove.rects.size === 1, 'remove: single rect removed');
    assert(!wrapRectsRemove.rects.has(rectToRemove1), 'remove: removed rect is no longer in set');
    assert(wrapRectsRemove.x === -10 && wrapRectsRemove.y === -10 && wrapRectsRemove.width === 30 && wrapRectsRemove.height === 30, 'remove: bounds shrunk after first remove');

    const nonExistentRect = new Rect(99, 99, 1, 1);
    wrapRectsRemove.remove(nonExistentRect);
    assert(wrapRectsRemove.rects.size === 1, 'remove: removing non-existent rect does not change size');

    wrapRectsRemove.remove(rectToRemove2);
    assert(wrapRectsRemove.rects.size === 0, 'remove: last rect removed, set is empty');
    assert(wrapRectsRemove.x === -10 && wrapRectsRemove.y === -10 && wrapRectsRemove.width === 10 && wrapRectsRemove.height === 10, 'remove: bounds reset after all rects removed');

    // --- Test getContainedRectsOverallBounds ---
    console.log('\n--- Testing getContainedRectsOverallBounds ---');
    const wrapRectsBounds = new WrapRects(0, 0, 0, 0, [
        new Rect(10, 10, 20, 20),
        new Rect(5, 5, 5, 5),
        new Rect(30, 30, 10, 10)
    ]);
    const boundsRect = wrapRectsBounds.getContainedRectsOverallBounds();
    assert(boundsRect.x === 5 && boundsRect.y === 5 && boundsRect.width === 35 && boundsRect.height === 35, 'getContainedRectsOverallBounds: correct bounds');

    // --- Test copy method ---
    console.log('\n--- Testing copy method ---');
    const wrapRectsCopy = wrapRects1.copy();
    assert(wrapRectsCopy.rects.size === wrapRects1.rects.size, 'copy: same size');
    assert(wrapRectsCopy !== wrapRects1, 'copy: new instance');
    assert(Array.from(wrapRectsCopy.rects)[0] !== Array.from(wrapRects1.rects)[0], 'copy: deep copy of rects');

    // --- Test filter methods ---
    console.log('\n--- Testing filter methods ---');
    const filterRect1 = new Rect(0, 0, 10, 10);
    const filterRect2 = new Rect(5, 5, 10, 10);
    const filterRect3 = new Rect(15, 15, 5, 5);
    const filterRectsCollection = new WrapRects(0, 0, 0, 0, [filterRect1, filterRect2, filterRect3]);
    const targetFilterRect = new Rect(2, 2, 8, 8); // Covers (2,2) to (10,10)

    const filteredIn = filterRectsCollection.toFilterRectsIn(targetFilterRect);
    assert(filteredIn.rects.size === 0, 'filterRectsIn: only filterRect1 should be fully contained (simplified check)');

    const filteredOverlap = filterRectsCollection.toFilterRectsOverlap(targetFilterRect);
    assert(filteredOverlap.rects.size === 2, 'filterRectsOverlap: filterRect1 and filterRect2 should overlap');

    const filteredOut = filterRectsCollection.toFilterRectsOut(targetFilterRect);
    assert(filteredOut.rects.size === 1, 'filterRectsOut: only filterRect3 should not overlap');

    // --- Test findEmptySpace and findRandomEmptySpace ---
    console.log('\n--- Testing findEmptySpace and findRandomEmptySpace ---');
    const spaceRects = new WrapRects(0, 0, 50, 50, [
        new Rect(0, 0, 20, 20),
        new Rect(30, 0, 20, 20)
    ]);
    const smallSize: SizeType = { width: 5, height: 5 };

    const emptySpace1 = spaceRects.findEmptySpace(smallSize);
    assert(emptySpace1 !== null, 'findEmptySpace: should find an empty space');
    if (emptySpace1) {
        assert(emptySpace1.x >= 0 && emptySpace1.x <= 50 && emptySpace1.y >= 0 && emptySpace1.y <= 50, 'findEmptySpace: found space within bounds');
    }

    const randomEmptySpace1 = spaceRects.findRandomEmptySpace(smallSize);
    assert(randomEmptySpace1 !== null, 'findRandomEmptySpace: should find a random empty space');

    // --- Test addRandomEmptySpaces and addRandomEmptySpace ---
    console.log('\n--- Testing addRandomEmptySpaces and addRandomEmptySpace ---');
    const addSpaceRects = new WrapRects(0, 0, 50, 50, [new Rect(0, 0, 10, 10)]);
    const sizesToAdd: SizeType[] = [{ width: 5, height: 5 }, { width: 8, height: 8 }];

    const addedRects = addSpaceRects.addRandomEmptySpaces(sizesToAdd);
    assert(addedRects.length === 2, 'addRandomEmptySpaces: should add two rects');
    assert(addSpaceRects.rects.size === 3, 'addRandomEmptySpaces: total rects count');

    const addedSingleRect = addSpaceRects.addRandomEmptySpace({ width: 7, height: 7 });
    assert(addedSingleRect !== null, 'addRandomEmptySpace: should add a single rect');
    assert(addSpaceRects.rects.size === 4, 'addRandomEmptySpace: total rects count');

    // --- Test isIn, isOut, isOverlap ---
    console.log('\n--- Testing isIn, isOut, isOverlap (WrapRects) ---');
    const testRects = new WrapRects(0, 0, 0, 0, [new Rect(10, 10, 10, 10)]);
    const testPoint = new Point2D(15, 15);
    const testRect = new Rect(12, 12, 5, 5);
    const nonOverlapRect = new Rect(100, 100, 5, 5);

    assert(testRects.isIn(testPoint), 'isIn: point inside');
    assert(!testRects.isOut(testPoint), 'isOut: point inside');
    assert(testRects.isOverlap(testRect), 'isOverlap: rect overlaps');
    assert(!testRects.isOverlap(nonOverlapRect), 'isOverlap: rect does not overlap');

    const otherWrapRects = new WrapRects(0, 0, 0, 0, [new Rect(18, 18, 5, 5)]);
    assert(testRects.isOverlap(otherWrapRects), 'isOverlap: WrapRects overlaps');

    // --- Test toRect ---
    console.log('\n--- Testing toRect (WrapRects) ---');
    const toRectWrap = new WrapRects(0, 0, 0, 0, [new Rect(10, 10, 5, 5), new Rect(20, 20, 5, 5)]);
    const overallRect = toRectWrap.toRect();
    assert(overallRect.x === 0 && overallRect.y === 0 && overallRect.width === 25 && overallRect.height === 25, 'toRect: correct overall bounding box');

    console.log('\n--- All WrapRects tests completed ---');
};