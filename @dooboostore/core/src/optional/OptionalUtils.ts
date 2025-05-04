export namespace OptionalUtils {
  export const mapIfPresent = <T,TT>(input: T | undefined | null, to: (input: T) => TT | undefined): TT | undefined => {
    if (input === undefined || input === null) {
      return undefined;
    } else {
      return to(input);
    }
  }
}