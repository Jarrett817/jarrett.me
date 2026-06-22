import type { InjectionKey, Ref } from 'vue';

export const slidesVisibleKey: InjectionKey<Ref<boolean>> = Symbol('slidesVisible');
