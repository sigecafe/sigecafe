import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import SharedAppTitle from "@/components/Shared/AppTitle.vue";

// Create stubs for the logo components
const stubs = {
  SharedLogoBeans: true,
  SharedLogoSige: true,
  SharedLogoCafe: true
};

describe("Unit Test Components", () => {
  it("Should render logo components", async () => {
    const helloComponent = await mountSuspended(SharedAppTitle, {
      global: {
        stubs
      }
    });

    // Check for logo container
    expect(helloComponent.find('.logo-container').exists()).toBe(true);

    // In a stubbed environment, the components will be rendered as custom elements
    // with the same name as the component
    expect(helloComponent.html()).toContain('shared-logo-beans-stub');
    expect(helloComponent.html()).toContain('shared-logo-sige-stub');
    expect(helloComponent.html()).toContain('shared-logo-cafe-stub');
  });
});
