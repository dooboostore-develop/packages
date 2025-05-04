import { Sim } from '@dooboostore/simple-boot/decorators/SimDecorator';
import { ExceptionHandler } from '@dooboostore/simple-boot/decorators/exception/ExceptionDecorator';

@Sim
export class GlobalAdvice {
    // @ExceptionHandler()
    // otherException(
    //     @Inject({situationType: ExceptionHandlerSituationType.ERROR_OBJECT}) e: any,
    //     @Inject({situationType: ExceptionHandlerSituationType.PARAMETER}) z: any,
    //         p: string
    // ) {
    //     console.log(`otherException: ${e.message} - -${z} ${p}`)
    // }

    @ExceptionHandler({type: Error})
    errorTypeException(e: Error) {
        console.log(`errorTypeException: ${e.message}-`)
    }
}
