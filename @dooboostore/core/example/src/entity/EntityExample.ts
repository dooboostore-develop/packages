import { Runnable } from '@dooboostore/core/runs/Runnable';
import { Point2D } from '@dooboostore/core/entity/Point2D';
import { Point3D } from '@dooboostore/core/entity/Point3D';
import { Rect } from '@dooboostore/core/entity/Rect';
import { Vector } from '@dooboostore/core/entity/Vector';

export class EntityExample implements Runnable {
  run(): void {
    console.log('\n=== Entity Example ===\n');
    
    console.log('1. Point2D:');
    const p1 = new Point2D(10, 20);
    const p2 = new Point2D(30, 40);
    console.log('  Point 1:', p1);
    console.log('  Point 2:', p2);
    const p3 = p1.copy();
    console.log('  Copied Point:', p3);
    
    console.log('\n2. Point2D from object:');
    const p4 = new Point2D({ x: 50, y: 60 });
    console.log('  Point from object:', p4);
    
    console.log('\n3. Point3D:');
    const p3d1 = new Point3D(1, 2, 3);
    const p3d2 = new Point3D(4, 5, 6);
    console.log('  Point3D 1:', p3d1);
    console.log('  Point3D 2:', p3d2);
    const p3d3 = p3d1.copy();
    console.log('  Copied Point3D:', p3d3);
    
    console.log('\n4. Rectangle:');
    const rect = new Rect(0, 0, 100, 50);
    console.log('  Rectangle:', rect);
    console.log('  X:', rect.x, 'Y:', rect.y);
    console.log('  Width:', rect.width);
    console.log('  Height:', rect.height);
    console.log('  Center:', rect.center);
    
    console.log('\n5. Vector:');
    const v1 = new Vector(3, 4);
    const v2 = new Vector(1, 2);
    console.log('  Vector 1:', v1);
    console.log('  Vector 2:', v2);
    console.log('  v1 + v2:', v1.add(v2.x, v2.y));
    
    console.log('\n=========================\n');
  }
}
