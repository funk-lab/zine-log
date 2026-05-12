declare module 'lodash-es' {
  export function throttle<T extends (...args: any[]) => any>(
    func: T,
    wait?: number,
    options?: { leading?: boolean; trailing?: boolean }
  ): T & { cancel(): void };

  // 如有其他 lodash-es 函数使用需求，可在此补充声明
}
