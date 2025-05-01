// type T0 = Exclude<undefined, unknown>;
// type T2 = Exclude<string | number | (() => void), Function>;
// type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
// type SubPartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export class Optional<T> {
    static readonly EMPTY = new Optional();


    constructor(private value?: T) {
    }

    public static ofNullable<T>(value: T): Optional<T> {
        return value == null ? Optional.empty() : Optional.of(value);
    }

    public static of<T>(value: T): Optional<T> {
    return new Optional<T>(value);
    }

    public orElse<T>(other: T): T {
        const val = this.isPresent() ? this.value : other;
        // return (this.value != null && this.value != undefined) ? this.value : other;
        return val as T;
    }
    public isPresent(): boolean {
        return (this.value != null && this.value != undefined);
    }

    // public ifPresent<T>(Consumer<? super T> consumer) {
    // if (value != null)
    // consumer.accept(value);
    // }

    public static empty<T>(): Optional<T> {
        return Optional.EMPTY as Optional<T>;
    }

    // public static default<T>(value: any, def: T): T {
    //     return (value != null && value != undefined) ? value : def;
    // }


}
