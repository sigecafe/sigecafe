export function useTabName() {
  const fileName = computed(() => {
    if (import.meta.env.DEV) {
      const url = getCurrentInstance()?.type.__file || "";
      return url.split("/").pop()?.split(".")[0] || "Todos";
    }

    const componentPath = getCurrentInstance()?.type.__name || "";
    return componentPath.split("/").pop()?.split(".")[0] || "Todos";
  });

  return {
    fileName
  };
}