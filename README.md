# Bug Example

## Steps to reproduce:

- Type slowly in the input field.

## Expected

- Headline updates with each keystroke.

## Result

- Some keystrokes are not reflected in the title, the title updates delayed by one keystroke.
- Happens in all Browsers, eg. Chrome `Version 70.0.3538.67 (Official Build) (64-bit)`

## Additional Info

- If you type fast, the update bug does not happen.
- `src\app\app.component.ts`, line 48 is related to the bug. If you comment it out, the bug does not happen.
- The Typescript config has `target=es2018`. If you lower the target to `es2016`, `es2015`, `es6` or `es5`, the bug does not happen.
- The unit test for this never fails.
