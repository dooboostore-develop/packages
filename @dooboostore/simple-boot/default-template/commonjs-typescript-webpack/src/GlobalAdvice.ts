import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { ExceptionHandler } from '@dooboostore/simple-boot/decorators/exception/ExceptionDecorator';

@Sim
export class GlobalAdvice {
    @ExceptionHandler()
    errorTypeException(e: Error) {
        console.log(`errorTypeException: ${e.message}`)
    }
}
