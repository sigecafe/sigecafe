import { defineStore } from "pinia";

interface HeaderState {
  mobileNav: boolean;
}

export const useHeaderStore = defineStore("header", {
  state: (): HeaderState => ({
    mobileNav: false
  })
});
