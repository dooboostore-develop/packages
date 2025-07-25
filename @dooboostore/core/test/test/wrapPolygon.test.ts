import { Point2D } from '@dooboostore/core/entity/Point2D';
import { Polygon } from '@dooboostore/core/entity/Polygon';
import { WrapPolygons } from '@dooboostore/core/entity/WrapPolygons';
import { Rect } from '@dooboostore/core/entity/Rect';

export const wrapPolygonTest = () => {

  console.log('--- WrapPolygons Comprehensive Test ---');

  // Helper function to log test results
  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
    } else {
      console.error(`❌ FAIL: ${message}`);
    }
  }

  // Helper to create a simple square polygon
  const createSquarePolygon = (x: number, y: number, size: number): Polygon => {
    return new Polygon([
      new Point2D(x, y),
      new Point2D(x + size, y),
      new Point2D(x + size, y + size),
      new Point2D(x, y + size),
    ]);
  };

  // Test Case 1: Constructor with initial bounds and no polygons
  console.log('\n--- Test Case 1: Constructor (initial bounds, no polygons) ---');
  const initialX1 = 10;
  const initialY1 = 20;
  const initialWidth1 = 100;
  const initialHeight1 = 200;
  const wrapPolygonsEmpty = new WrapPolygons(initialX1, initialY1, initialWidth1, initialHeight1);
  assert(wrapPolygonsEmpty.x === initialX1 && wrapPolygonsEmpty.y === initialY1 &&
         wrapPolygonsEmpty.width === initialWidth1 && wrapPolygonsEmpty.height === initialHeight1,
         'Constructor: Bounds set correctly when no polygons provided');
  assert(wrapPolygonsEmpty.polygons.length === 0, 'Constructor: No polygons added');

  // Test Case 2: Constructor with initial bounds and polygons (no initial transformation)
  console.log('\n--- Test Case 2: Constructor (initial bounds, with polygons) ---');
  const initialX2 = 50;
  const initialY2 = 50;
  const initialWidth2 = 100;
  const initialHeight2 = 100;
  const polyA = createSquarePolygon(0, 0, 10); // Small polygon at origin
  const polyB = createSquarePolygon(10, 10, 20); // Larger polygon

  const wrapPolygonsWithPolygons = new WrapPolygons(
    initialX2, initialY2, initialWidth2, initialHeight2,
    [polyA, polyB]
  );

  // The constructor should NOT transform polygons initially. It should just set its own x,y,w,h
  // and then _calculateOverallBounds will adjust x,y,w,h based on polygons, respecting initial bounds.
  // The actual bounds of polyA and polyB are x=0, y=0, width=30, height=30
  // Since initial bounds (50,50,100,100) are larger, the overall bounds should be (0,0,150,150) after _calculateOverallBounds
  assert(wrapPolygonsWithPolygons.x === Math.min(0, initialX2) && wrapPolygonsWithPolygons.y === Math.min(0, initialY2) &&
         wrapPolygonsWithPolygons.width === Math.max(30, initialX2 + initialWidth2) - Math.min(0, initialX2) &&
         wrapPolygonsWithPolygons.height === Math.max(30, initialY2 + initialHeight2) - Math.min(0, initialY2),
         'Constructor: Overall bounds correctly calculated based on polygons and initial bounds');

  // Verify that internal polygon points are NOT transformed by the constructor
  const originalPolyA = Array.from(wrapPolygonsWithPolygons.polygons)[0];
  const originalPolyB = Array.from(wrapPolygonsWithPolygons.polygons)[1];
  assert(originalPolyA['point2ds'][0].x === 0 && originalPolyA['point2ds'][0].y === 0,
         'Constructor: PolyA points are not transformed initially');
  assert(originalPolyB['point2ds'][0].x === 10 && originalPolyB['point2ds'][0].y === 10,
         'Constructor: PolyB points are not transformed initially');

  // Test Case 3: set x - translation
  console.log('\n--- Test Case 3: set x (translation) ---');
  const wrapPolygonsX = new WrapPolygons(0, 0, 100, 100, [createSquarePolygon(0, 0, 10)]);
  const initialPolyX = Array.from(wrapPolygonsX.polygons)[0];
  wrapPolygonsX.x = 5; // Move from 0 to 5
  assert(wrapPolygonsX.x === 5, 'x property updated');
  // Check if internal polygon points are translated
  assert(initialPolyX['point2ds'][0].x === 5 && initialPolyX['point2ds'][0].y === 0,
         'Polygon point (0,0) translated to (5,0)');
  assert(initialPolyX['point2ds'][1].x === 15 && initialPolyX['point2ds'][1].y === 0,
         'Polygon point (10,0) translated to (15,0)');
  assert(wrapPolygonsX.toRect().x === 5 && wrapPolygonsX.toRect().width === 100,
         'Overall rect x and width are correct after x translation');

  // Test Case 4: set y - translation
  console.log('\n--- Test Case 4: set y (translation) ---');
  const wrapPolygonsY = new WrapPolygons(0, 0, 100, 100, [createSquarePolygon(0, 0, 10)]);
  const initialPolyY = Array.from(wrapPolygonsY.polygons)[0];
  wrapPolygonsY.y = 5; // Move from 0 to 5
  assert(wrapPolygonsY.y === 5, 'y property updated');
  // Check if internal polygon points are translated
  assert(initialPolyY['point2ds'][0].x === 0 && initialPolyY['point2ds'][0].y === 5,
         'Polygon point (0,0) translated to (0,5)');
  assert(initialPolyY['point2ds'][2].x === 10 && initialPolyY['point2ds'][2].y === 15,
         'Polygon point (10,10) translated to (10,15)');
  assert(wrapPolygonsY.toRect().y === 5 && wrapPolygonsY.toRect().height === 100,
         'Overall rect y and height are correct after y translation');

  // Test Case 5: set width - scaling
  console.log('\n--- Test Case 5: set width (scaling) ---');
  const wrapPolygonsWidth = new WrapPolygons(10, 10, 100, 100, [createSquarePolygon(10, 10, 10)]); // x=10, y=10, w=10, h=10
  const initialPolyW = Array.from(wrapPolygonsWidth.polygons)[0];
  wrapPolygonsWidth.width = 200; // Scale width from 100 to 200 (factor 2)
  assert(wrapPolygonsWidth.width === 200, 'width property updated');
  // Check if internal polygon points are scaled relative to x
  assert(initialPolyW['point2ds'][0].x === 10 && initialPolyW['point2ds'][0].y === 10,
         'Polygon point (10,10) remains at (10,10) (origin)');
  assert(initialPolyW['point2ds'][1].x === 10 + (10 * (200/100)) && initialPolyW['point2ds'][1].y === 10,
         'Polygon point (20,10) scaled to (30,10)'); // (10 + (20-10)*2, 10)
  assert(wrapPolygonsWidth.toRect().width === 200,
         'Overall rect width is correct after width scaling');

  // Test Case 6: set height - scaling
  console.log('\n--- Test Case 6: set height (scaling) ---');
  const wrapPolygonsHeight = new WrapPolygons(10, 10, 100, 100, [createSquarePolygon(10, 10, 10)]); // x=10, y=10, w=10, h=10
  const initialPolyH = Array.from(wrapPolygonsHeight.polygons)[0];
  wrapPolygonsHeight.height = 200; // Scale height from 100 to 200 (factor 2)
  assert(wrapPolygonsHeight.height === 200, 'height property updated');
  // Check if internal polygon points are scaled relative to y
  assert(initialPolyH['point2ds'][0].x === 10 && initialPolyH['point2ds'][0].y === 10,
         'Polygon point (10,10) remains at (10,10) (origin)');
  assert(initialPolyH['point2ds'][3].x === 10 && initialPolyH['point2ds'][3].y === 10 + (10 * (200/100)),
         'Polygon point (10,20) scaled to (10,30)'); // (10, 10 + (20-10)*2)
  assert(wrapPolygonsHeight.toRect().height === 200,
         'Overall rect height is correct after height scaling');

  // Test Case 7: Combined set width and set height
  console.log('\n--- Test Case 7: Combined width and height scaling ---');
  const wrapPolygonsCombined = new WrapPolygons(0, 0, 100, 100, [createSquarePolygon(0, 0, 10)]); // x=0, y=0, w=10, h=10
  const initialPolyC = Array.from(wrapPolygonsCombined.polygons)[0];
  wrapPolygonsCombined.width = 200; // Scale x by 2
  wrapPolygonsCombined.height = 50;  // Scale y by 0.5
  assert(wrapPolygonsCombined.width === 200 && wrapPolygonsCombined.height === 50,
         'width and height properties updated');
  assert(initialPolyC['point2ds'][0].x === 0 && initialPolyC['point2ds'][0].y === 0,
         'Polygon point (0,0) remains at (0,0) (origin)');
  assert(initialPolyC['point2ds'][1].x === 0 + (10 * (200/100)) && initialPolyC['point2ds'][1].y === 0,
         'Polygon point (10,0) scaled to (20,0)');
  assert(initialPolyC['point2ds'][3].x === 0 && initialPolyC['point2ds'][3].y === 0 + (10 * (50/100)),
         'Polygon point (0,10) scaled to (0,5)');
  assert(initialPolyC['point2ds'][2].x === 0 + (10 * (200/100)) && initialPolyC['point2ds'][2].y === 0 + (10 * (50/100)),
         'Polygon point (10,10) scaled to (20,5)');
  assert(wrapPolygonsCombined.toRect().width === 200 && wrapPolygonsCombined.toRect().height === 50,
         'Overall rect width and height are correct after combined scaling');

  // Test Case 8: set x and set y after scaling
  console.log('\n--- Test Case 8: Translation after scaling ---');
  const wrapPolygonsTranslateAfterScale = new WrapPolygons(0, 0, 100, 100, [createSquarePolygon(0, 0, 10)]);
  const initialPolyTAS = Array.from(wrapPolygonsTranslateAfterScale.polygons)[0];
  wrapPolygonsTranslateAfterScale.width = 200; // Scale x by 2
  wrapPolygonsTranslateAfterScale.height = 200; // Scale y by 2
  wrapPolygonsTranslateAfterScale.x = 10; // Translate x by 10
  wrapPolygonsTranslateAfterScale.y = 10; // Translate y by 10

  assert(wrapPolygonsTranslateAfterScale.x === 10 && wrapPolygonsTranslateAfterScale.y === 10,
         'x and y properties updated after scaling');
  assert(initialPolyTAS['point2ds'][0].x === 10 && initialPolyTAS['point2ds'][0].y === 10,
         'Polygon point (0,0) scaled then translated to (10,10)');
  assert(initialPolyTAS['point2ds'][1].x === 10 + (10 * 2) && initialPolyTAS['point2ds'][1].y === 10,
         'Polygon point (10,0) scaled then translated to (30,10)');
  assert(initialPolyTAS['point2ds'][2].x === 10 + (10 * 2) && initialPolyTAS['point2ds'][2].y === 10 + (10 * 2),
         'Polygon point (10,10) scaled then translated to (30,30)');
  assert(wrapPolygonsTranslateAfterScale.toRect().x === 10 && wrapPolygonsTranslateAfterScale.toRect().y === 10 &&
         wrapPolygonsTranslateAfterScale.toRect().width === 200 && wrapPolygonsTranslateAfterScale.toRect().height === 200,
         'Overall rect bounds correct after scaling and translation');

  // Test Case 9: _calculateOverallBounds - shrinking below initial bounds
  console.log('\n--- Test Case 9: _calculateOverallBounds - shrinking ---');
  const initialX9 = 10;
  const initialY9 = 10;
  const initialWidth9 = 50;
  const initialHeight9 = 50;
  const polyF = createSquarePolygon(20, 20, 10); // Inside initial bounds
  const wrapPolygonsShrink = new WrapPolygons(
    initialX9, initialY9, initialWidth9, initialHeight9,
    [polyF]
  );
  // After constructor, _calculateOverallBounds is called. The polygon (20,20,10,10) is within (10,10,50,50).
  // So the overall bounds should be (10,10,50,50).
  assert(wrapPolygonsShrink.x === initialX9 && wrapPolygonsShrink.y === initialY9 &&
         wrapPolygonsShrink.width === initialWidth9 && wrapPolygonsShrink.height === initialHeight9,
         'Shrink: Initial bounds are maintained when polygon is smaller');

  // Test Case 10: _calculateOverallBounds - expanding beyond initial bounds
  console.log('\n--- Test Case 10: _calculateOverallBounds - expanding ---');
  const initialX10 = 0;
  const initialY10 = 0;
  const initialWidth10 = 20;
  const initialHeight10 = 20;
  const polyG = createSquarePolygon(0, 0, 10); // Fits initial bounds
  const wrapPolygonsExpand = new WrapPolygons(
    initialX10, initialY10, initialWidth10, initialHeight10,
    [polyG]
  );
  assert(wrapPolygonsExpand.x === initialX10 && wrapPolygonsExpand.y === initialY10 &&
         wrapPolygonsExpand.width === initialWidth10 && wrapPolygonsExpand.height === initialHeight10,
         'Expand: Initial bounds are correct initially');

  const polyH = createSquarePolygon(30, 30, 10); // Outside initial bounds
  wrapPolygonsExpand.add(polyH);
  // After adding polyH, the overall bounds should expand to cover (0,0) to (40,40)
  assert(wrapPolygonsExpand.x === 0 && wrapPolygonsExpand.y === 0 &&
         wrapPolygonsExpand.width === 40 && wrapPolygonsExpand.height === 40,
         'Expand: Bounds expand to cover new polygon');

  // Test Case 11: copy() method
  console.log('\n--- Test Case 11: copy() method ---');
  const copiedWrapPolygons = wrapPolygonsWithPolygons.copy(); // Using wrapPolygonsWithPolygons from Test Case 2
  assert(copiedWrapPolygons.x === wrapPolygonsWithPolygons.x && copiedWrapPolygons.y === wrapPolygonsWithPolygons.y &&
         copiedWrapPolygons.width === wrapPolygonsWithPolygons.width && copiedWrapPolygons.height === wrapPolygonsWithPolygons.height,
         'Copy: Copied instance retains current bounds');
  assert(copiedWrapPolygons !== wrapPolygonsWithPolygons, 'Copy: New instance created');
  assert(Array.from(copiedWrapPolygons.polygons)[0] !== Array.from(wrapPolygonsWithPolygons.polygons)[0],
         'Copy: Polygons are deep copied');

  // Test Case 12: Filter methods retain initial bounds
  console.log('\n--- Test Case 12: Filter methods retain initial bounds ---');
  const filterTargetRect = new Rect(initialX2 + 10, initialY2 + 10, 20, 20);

  const filteredIn = wrapPolygonsWithPolygons.filterPolygonsIn(filterTargetRect);
  assert(filteredIn.x === initialX2 && filteredIn.y === initialY2 &&
         filteredIn.width === initialWidth2 && filteredIn.height === initialHeight2,
         'FilterIn: Retains initial bounds');

  const filteredOut = wrapPolygonsWithPolygons.filterPolygonsOut(filterTargetRect);
  assert(filteredOut.x === 0 && filteredOut.y === 0 &&
         filteredOut.width === initialX2+initialWidth2 && filteredOut.height === initialY2+initialHeight2,
         'FilterOut: Retains initial bounds');

  const filteredOverlap = wrapPolygonsWithPolygons.filterPolygonsOverlap(filterTargetRect);
  assert(filteredOverlap.x === initialX2 && filteredOverlap.y === initialY2 &&
         filteredOverlap.width === initialWidth2 && filteredOverlap.height === initialHeight2,
         'FilterOverlap: Retains initial bounds');

  console.log('\n--- All WrapPolygons Comprehensive tests completed ---');
};