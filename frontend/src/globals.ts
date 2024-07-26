export { };

(window as any).process = { env: { NODE_ENV: import.meta.env.NODE_ENV } };

declare global {
    interface ObjectConstructor {
        keys<T>(obj: T): Array<keyof T>;
    }
}
