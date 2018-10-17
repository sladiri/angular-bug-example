import { Component } from "@angular/core";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  public transducers = []; // Test API

  title = "angular-bug-example";

  private callback: Function = null;
  private queue = [];

  constructor() {
    const transducers = [
      this.updateState.bind(this),
      this.dummyTransducer, // yielding here causes the bug
    ];
    this.start(transducers);
  }

  public start(transducers = []) {
    this.transducers = transducers;
    const pipeline = this.pipelineTransducers(transducers);
    const processed = pipeline(this.share(this.share(this.produce())));
    this.consume(processed);
  }

  textUpdated(value) {
    this.send({ title: value });
  }

  private async *updateState(source) {
    for await (const item of source) {
      const { title } = item;
      if (typeof title === "string") {
        this.title = title;
        console.log(`this.title=[${this.title}]`);
      }
      yield item;
    }
  }

  private async *dummyTransducer(source) {
    for await (const item of source) {
      yield item; // adding this yield causes the bug
    }
  }

  private send(item) {
    if (!this.queue.length && this.callback) {
      this.callback();
    }
    this.queue.push(item);
  }

  private share(iterable) {
    const iterator = iterable[Symbol.asyncIterator]();

    return Object.assign(Object.create(null), {
      next: () => iterator.next(),
      [Symbol.asyncIterator]() {
        return this;
      },
    });
  }

  private async *produce() {
    while (true) {
      while (this.queue.length) {
        const value = this.queue.shift();
        yield value;
      }
      await new Promise(i => {
        this.callback = i;
      });
    }
  }

  private async consume(input) {
    for await (const i of input) {
    }
  }

  private pipelineTransducers(transducers = []) {
    const pipeline = item => {
      for (const transducer of transducers) {
        const source = this.share(item);
        item = transducer(source);
      }
      return item;
    };
    return pipeline;
  }
}
