import { TestBed, async } from "@angular/core/testing";
import { lensPath, view } from "ramda/es";
import { AppComponent } from "./app.component";

const testEvents = (context, actions = []) =>
  new Promise((resolve, reject) => {
    const transducers = [
      ...context.transducers,
      async function*(source) {
        const states = [];
        let i = 0;
        for await (const item of source) {
          const [, paths] = actions[i];
          states.push(paths.map(p => view(lensPath(p), context)));
          if (states.length === actions.length) {
            break;
          }
          i += 1;
        }
        resolve(states);
      },
    ];
    context.start(transducers);
    for (const [[action, ...params]] of actions) {
      action.apply(context, params);
    }
  });

describe("AppComponent", () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent],
    }).compileComponents();
  }));

  it("should create the app", () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'angular-bug-example'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual("angular-bug-example");
  });

  it("should render title in a h1 tag", () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector("h1").textContent).toContain(
      "Welcome to angular-bug-example!",
    );
  });

  it("should update the input text", async(async () => {
    try {
      const fixture = TestBed.createComponent(AppComponent);
      const app = fixture.debugElement.componentInstance;

      const states = await testEvents(app, [
        [[app.textUpdated, "a"], [["title"]]],
        [[app.textUpdated, "ab"], [["title"]]],
        [[app.textUpdated, "abc"], [["title"]]],
      ]);
      // Unit test is fine, but view is not
      expect(states).toEqual([["a"], ["ab"], ["abc"]]);
    } catch (error) {
      console.error(error);
    }
  }));
});
